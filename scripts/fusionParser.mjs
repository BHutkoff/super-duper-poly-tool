const NON_MATERIAL_PATTERNS = [
  /cannot/i,
  /must be/i,
  /if this card/i,
  /when this card/i,
  /also treated/i,
  /special summoned/i,
  /fusion summoned/i,
  /except/i,
];

export function parseFusionMaterial(text) {
  if (!text || typeof text !== "string") {
    return { raw: text, materials: [] };
  }

  const raw = text.replace(/\r?\n/g, " ").trim();

  const clauses = raw
    .split(/\s\+\s/)
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c) => !NON_MATERIAL_PATTERNS.some((p) => p.test(c)));

  const materials = clauses.map(parseClause);

  return {
    raw,
    materials,
  };
}

function parseClause(clause) {
  const original = clause;

  // -------------------------
  // TYPE (Fusion / Synchro / etc.)
  // -------------------------
  const type =
    /\bFusion Monster\b/i.test(clause)
      ? "Fusion"
      : /\bSynchro Monster\b/i.test(clause)
      ? "Synchro"
      : /\bXyz Monster\b/i.test(clause)
      ? "XYZ"
      : /\bLink Monster\b/i.test(clause)
      ? "Link"
      : /\bEffect Monster\b/i.test(clause)
      ? "Effect"
      : /\bNormal Monster\b/i.test(clause)
      ? "Normal"
      : null;

  // -------------------------
  // SUBTYPE (IMPORTANT FIX)
  // -------------------------
  const subtype =
    /\bGemini Monster\b/i.test(clause)
      ? "Gemini"
      : /\bTuner Monster\b/i.test(clause)
      ? "Tuner"
      : /\bToon Monster\b/i.test(clause)
      ? "Toon"
      : /\bSpirit Monster\b/i.test(clause)
      ? "Spirit"
      : /\bUnion Monster\b/i.test(clause)
      ? "Union"
      : null;

  // -------------------------
  // ATTRIBUTE
  // -------------------------
  const attributeMatch = clause.match(
    /\b(DARK|LIGHT|EARTH|WATER|FIRE|WIND|DIVINE)\b/i
  );

  // -------------------------
  // RACE
  // -------------------------
  const raceMatch = clause.match(
    /\b(Dragon|Warrior|Spellcaster|Beast|Fiend|Fairy|Machine|Psychic|Cyberse|Plant|Zombie|Aqua|Pyro|Rock|Reptile|Sea Serpent|Thunder|Winged Beast)\b/i
  );

  // -------------------------
  // LEVEL / RANK / LINK
  // -------------------------
  const levelMatch = clause.match(/Level\s+(\d+)/i);
  const rankMatch = clause.match(/Rank\s+(\d+)/i);
  const linkMatch = clause.match(/Link\s+(\d+)/i);

  // -------------------------
  // NAME LOCK
  // -------------------------
  let name = null;
  const quoted = clause.match(/"([^"]+)"/);
  if (quoted) name = quoted[1];

  // -------------------------
  // OR LOGIC (light support)
  // -------------------------
  let orOptions = null;
  if (/\bor\b/i.test(clause)) {
    orOptions = clause.split(/\sor\s/i).map((s) => s.trim());
  }

  return {
    raw: original,
    name,
    type,
    subtype,
    attribute: attributeMatch?.[1]?.toUpperCase() || null,
    race: raceMatch?.[1] || null,
    level: levelMatch ? Number(levelMatch[1]) : null,
    rank: rankMatch ? Number(rankMatch[1]) : null,
    link: linkMatch ? Number(linkMatch[1]) : null,
    orOptions,
  };
}