import { readFile, writeFile } from "node:fs/promises";

const cards = JSON.parse(
  await readFile("data/processed/cards.min.json", "utf8")
);

// ---------- INPUT ----------
const TARGET_NAME = process.argv[2];

if (!TARGET_NAME) {
  console.log("Usage: node scripts/testBridge.mjs <card name>");
  process.exit(1);
}

// ---------- HELPERS ----------
function findCardByName(name) {
  return cards.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

function isBridgeCandidate(card) {
  if (!card.type) return false;

  const isMonster = card.type.includes("Monster");
  if (!isMonster) return false;

  const isExtraDeck =
    card.type.includes("Fusion") ||
    card.type.includes("Synchro");
    //card.type.includes("XYZ") ||
    //card.type.includes("Link");

  if (!isExtraDeck) return false;

  if (!card.attribute || !card.race) return false;

  return true;
}

function getLevelLikeValue(card) {
  return card.level ?? card.rank ?? card.linkval;
}

// ---------- MAIN ----------
const target = findCardByName(TARGET_NAME);

if (!target) {
  console.log("Target not found:", TARGET_NAME);
  process.exit(1);
}

console.log("Target:", target.name);
console.log(
  `Attribute: ${target.attribute}, Race: ${target.race}, Level-like: ${getLevelLikeValue(target)}`
);

// ---------- BRIDGES ----------
const bridges = cards.filter((card) => {
  if (!isBridgeCandidate(card)) return false;

  const tv = getLevelLikeValue(target);
  const cv = getLevelLikeValue(card);

  if (tv == null || cv == null) return false;

  return (
    card.attribute === target.attribute &&
    card.race === target.race &&
    cv !== tv
  );
});

// ---------- OUTPUT ----------
console.log(`\nBridges found: ${bridges.length}\n`);

bridges.slice(0, 30).forEach((b) => {
  console.log(`- ${b.name} (${b.type})`);
});

// ---------- EXPORT ----------
await writeFile(
  "data/processed/bridges.json",
  JSON.stringify(
    bridges.map((b) => ({
      name: b.name,
      attribute: b.attribute,
      race: b.race,
      level: b.level,
      rank: b.rank,
      linkval: b.linkval,
      type: b.type,
    })),
    null,
    2
  ),
  "utf8"
);

console.log("\nSaved → data/processed/bridges.json");