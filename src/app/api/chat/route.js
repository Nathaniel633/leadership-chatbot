import { NextResponse } from "next/server";
import OpenAI from "openai";
import { loadScenarios } from "@/lib/scenarios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: build short list of candidates for GPT to choose from
function buildCandidateList(scenarios) {
  return scenarios
    .map((row, index) => {
      const id = row.ID ? String(row.ID).trim() : String(index + 1);
      const title = String(row.SkillScenario ?? "").trim();
      return `${id}: ${title}`;
    })
    .join("\n");
}

// Helper: turn multiline text into bullets
function toBullets(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `- ${l.replace(/^[•\-]\s*/, "")}`)
    .join("\n");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = String(body.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const scenarios = loadScenarios();

    if (!scenarios.length) {
      return NextResponse.json(
        { error: "No scenarios loaded from CSV" },
        { status: 500 }
      );
    }

    /* -------------------------------------------------
       STEP 1: Ask GPT which scenario matches best
    --------------------------------------------------*/
    const candidates = buildCandidateList(scenarios);

    const selector = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You match a user's situation to the single best scenario. " +
            "Return ONLY the ID number from the list. No explanation.",
        },
        {
          role: "user",
          content: `User situation:\n${message}\n\nScenarios:\n${candidates}`,
        },
      ],
    });

    const rawId =
      selector.choices?.[0]?.message?.content?.trim() ?? "";
    const chosenId = rawId.replace(/[^\d]/g, "");

    /* -------------------------------------------------
       STEP 2: Find the selected row
    --------------------------------------------------*/
    const row =
      scenarios.find((r, i) => {
        const id = r.ID ? String(r.ID).trim() : String(i + 1);
        return id === chosenId;
      }) || scenarios[0]; // fallback safety

    /* -------------------------------------------------
       STEP 3: Build grounded response from CSV
    --------------------------------------------------*/
    const skillScenario = String(row.SkillScenario ?? "").trim();
    const strategies = String(row.TargetStrategies ?? "").trim();
    const language = String(row.TargetLanguage ?? "").trim();
    const example = String(row["Example Dialogue"] ?? "").trim();

    const response = `
**Scenario:** ${skillScenario}

---

### **Strategy**
${strategies ? toBullets(strategies) : "- (No strategy provided)"}

---

### **Language to Use**
${language ? toBullets(language) : "- (No language provided)"}

---

### **Example Dialogue**
${example || "_(No example dialogue provided)_"}
`.trim();

    return NextResponse.json({
      response,
      matchedScenario: skillScenario,
      matchedId: chosenId || null,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
