import { NextResponse } from "next/server";
import { loadScenarios } from "@/lib/scenarios";

export async function POST(req) {
  try {
    const body = await req.json();
    const message = String(body.message ?? "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const scenarios = loadScenarios();
    if (!scenarios.length) {
      return NextResponse.json({ error: "No scenarios loaded from CSV" }, { status: 500 });
    }

    // ✅ For now: use the first (and only filled) row to prove grounding works
    const row = scenarios[0];

    const skillScenario = String(row.SkillScenario ?? "").trim();
    const strategies = String(row.TargetStrategies ?? "").trim();
    const language = String(row.TargetLanguage ?? "").trim();
    const example = String(row["Example Dialogue"] ?? "").trim();

    // ✅ Return ONLY what’s in your data (no hallucination)
    // You can format it nicely for the UI.
    const response = `
**Scenario:** ${skillScenario}

---

### **Strategy**
${strategies
  .split("\n")
  .filter(Boolean)
  .map((s) => `- ${s.trim()}`)
  .join("\n")}

---

### **Language to Use**
${language
  .split("\n")
  .filter(Boolean)
  .map((l) => `- ${l.trim()}`)
  .join("\n")}

---

### **Example Dialogue**
${example}
`.trim();


    return NextResponse.json({
      response,
      matchedScenario: skillScenario
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
