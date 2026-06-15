import { readFile } from "node:fs/promises";
import { parseFusionMaterial } from "./fusionParser.mjs";

const cards = JSON.parse(
  await readFile("data/processed/cards.min.json", "utf8")
);

const bridges = JSON.parse(
  await readFile("data/processed/bridges.json", "utf8")
);

// ---------- INPUT ----------
const TARGET_NAME = process.argv[2];

if (!TARGET_NAME) {
  console.log("Usage: node scripts/testFusion.mjs <card name>");
  process.exit(1);
}

// ---------- HELPERS ----------
function normalize(str) {
  return str?.trim().toLowerCase();
}

function findCardByName(name) {
  return cards.find((c) => normalize(c.name) === normalize(name));
}

function typeMatches(cardType, reqType) {
  return (cardType || "").toLowerCase().includes(reqType.toLowerCase());
}

// ---------- TARGET ----------
const target = findCardByName(TARGET_NAME);

if (!target) {
  console.log("Target not found:", TARGET_NAME);
  process.exit(1);
}

console.log("Target:", target.name);
console.log("Attribute:", target.attribute, "Race:", target.race);

// ---------- MATCHER ----------
function match(req, card) {
  if (!req) return true;

  if (req.name) {
    return normalize(card.name) === normalize(req.name);
  }

  if (req.attribute && req.attribute !== card.attribute) return false;

  if (req.race && req.race !== card.race) return false;

  // TYPE
  if (req.type) {
    if (!typeMatches(card.type, req.type)) return false;
  }

  // SUBTYPE (NEW CRITICAL FIX)
  if (req.subtype) {
    if ((card.subtype || "") !== req.subtype) return false;
  }

  return true;
}

// ---------- FUSION CHECK ----------
function canFuse(target, bridge, fusion) {
  if (!fusion?.desc) return false;
  if (!fusion.type?.includes("Fusion")) return false;

  const parsed = parseFusionMaterial(fusion.desc);

  if (!parsed?.materials?.length) return false;

  // strict v1: 2-material fusion only
  if (parsed.materials.length !== 2) return false;

  const t = target;
  const b = bridge;

  const [m1, m2] = parsed.materials;

  return (
    (match(m1, t) && match(m2, b)) ||
    (match(m1, b) && match(m2, t))
  );
}

// ---------- MAIN ----------
const fusionResults = [];

for (const bridge of bridges) {
  for (const fusion of cards) {
    if (!fusion.type?.includes("Fusion")) continue;

    if (canFuse(target, bridge, fusion)) {
      fusionResults.push({
        target: target.name,
        bridge: bridge.name,
        fusion: fusion.name,
      });
    }
  }
}

// ---------- OUTPUT ----------
console.log(`\nBridges loaded: ${bridges.length}`);
console.log(`Fusion results: ${fusionResults.length}\n`);

fusionResults.slice(0, 150).forEach((r) => {
  console.log(`${r.bridge} → ${r.fusion}`);
});