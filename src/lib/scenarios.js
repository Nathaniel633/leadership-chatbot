import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";


let cached = null;

export function loadScenarios() {
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "data", "Leadership_Chatbot_DataSource_v2.csv");
  const csvText = fs.readFileSync(filePath, "utf8");

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log("Loaded scenarios:", records.length, "first:", records[0]?.SkillScenario);
  console.log(
  "Loaded",
  records.length,
  "scenarios from v2. First:",
  records[0]?.SkillScenario
);

  cached = records.filter((r) => r.SkillScenario && String(r.SkillScenario).trim().length > 0);
  return cached;
}
