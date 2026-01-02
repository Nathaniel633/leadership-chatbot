import { NextResponse } from "next/server";
import OpenAI from "openai";
import { loadScenarios } from "@/lib/scenarios";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const message = String(body.message ?? "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const scenarios = loadScenarios();
    const first = scenarios[0];

    const systemPrompt = `
You are a leadership coaching assistant who ROLEPLAYS business scenarios with the user.

You must:
1) Ask 1-2 clarifying questions if needed.
2) Provide an effective strategy (bulleted).
3) Provide recommended language the user can say verbatim.
4) Roleplay a short dialogue: you are the other person in the scenario.
5) Keep it practical, concise, and realistic.

Scenario Data (authoritative):
SkillScenario: ${first?.SkillScenario ?? ""}

TargetStrategies:
${first?.TargetStrategies ?? ""}

TargetLanguage:
${first?.TargetLanguage ?? ""}

ExampleDialogue:
${first?.["Example Dialogue"] ?? ""}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content ?? "No response.";
    return NextResponse.json({ response: reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
