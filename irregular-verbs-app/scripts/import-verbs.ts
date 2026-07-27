/**
 * Importer: converts a Word (.docx) table of irregular verbs into the app's
 * canonical dataset shape (src/data/verbs.json).
 *
 * Expected table shape (repeated across any number of 3-column groups per row):
 *   "Infinitive: spanish meaning" | "Past Simple" | "Past Participle"
 *
 * Usage:
 *   npm run import-verbs -- "path/to/Verbs.docx" [outputName]
 *
 * Designed so future datasets (regular verbs, phrasal verbs, vocabulary sets)
 * can reuse this same pipeline — only the table-cell mapping below would change.
 */
import AdmZip from "adm-zip";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Verb } from "../src/domain/verb";

function extractDocumentXml(docxPath: string): string {
  const zip = new AdmZip(docxPath);
  const entry = zip.getEntry("word/document.xml");
  if (!entry) {
    throw new Error(`"${docxPath}" does not look like a valid .docx (missing word/document.xml)`);
  }
  return zip.readAsText(entry);
}

function cellText(cellXml: string): string {
  const matches = [...cellXml.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/gs)];
  return matches.map((m) => m[1]).join("").trim();
}

function splitOnSlashOrSemicolon(value: string): string[] {
  return value
    .split(/[/;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Parses the raw `document.xml` markup into flat [infinitive+meaning, pastSimple, pastParticiple] triples. */
function parseRows(xml: string): string[][] {
  const rows = xml.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) ?? [];
  const triples: string[][] = [];

  // First row is the repeated header ("Infinitive" / "Psimple" / "PParticiple").
  for (const row of rows.slice(1)) {
    const cells = row.match(/<w:tc\b[\s\S]*?<\/w:tc>/g) ?? [];
    const texts = cells.map(cellText);
    for (let i = 0; i < texts.length; i += 3) {
      const group = texts.slice(i, i + 3);
      if (group.length === 3 && group.some((g) => g.length > 0)) {
        triples.push(group);
      }
    }
  }
  return triples;
}

function toVerb(triple: string[]): Verb {
  const [infinitiveCell, pastSimpleCell, pastParticipleCell] = triple;
  const [infinitivePart, meaningPart] = infinitiveCell.split(":").map((s) => s.trim());

  const infinitive = infinitivePart.toLowerCase();
  const pastSimple = splitOnSlashOrSemicolon(pastSimpleCell).map((s) => s.toLowerCase());
  const pastParticiple = splitOnSlashOrSemicolon(pastParticipleCell).map((s) => s.toLowerCase());
  const meanings = meaningPart ? splitOnSlashOrSemicolon(meaningPart) : [];

  return {
    id: slugify(infinitive),
    infinitive,
    pastSimple,
    pastParticiple,
    meanings,
  };
}

function main() {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3] ?? "verbs.json";

  if (!inputArg) {
    console.error("Usage: npm run import-verbs -- <path-to-docx> [outputFileName]");
    process.exit(1);
  }

  const docxPath = resolve(inputArg);
  const xml = extractDocumentXml(docxPath);
  const triples = parseRows(xml);
  const verbs = triples.map(toVerb);

  // Dedupe by id in case a source document repeats a verb.
  const byId = new Map<string, Verb>();
  for (const verb of verbs) byId.set(verb.id, verb);
  const deduped = [...byId.values()].sort((a, b) => a.infinitive.localeCompare(b.infinitive));

  const outPath = resolve("src/data", outputArg);
  writeFileSync(outPath, JSON.stringify(deduped, null, 2) + "\n", "utf-8");

  console.log(`Imported ${deduped.length} verbs from "${docxPath}" -> ${outPath}`);
}

main();
