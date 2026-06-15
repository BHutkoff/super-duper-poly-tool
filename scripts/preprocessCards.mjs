import { readFile, writeFile, mkdir } from "node:fs/promises";

const raw = JSON.parse(
  await readFile("data/raw/cards.json", "utf8")
);

const simplified = raw.data.map((card) => ({
  id: card.id,

  name: card.name,

  frameType: card.frameType,

  type: card.type,

  race: card.race,

  attribute: card.attribute,

  level: card.level,

  rank: card.rank,

  linkval: card.linkval,

  atk: card.atk,

  def: card.def,

  desc: card.desc,
}));

await mkdir("data/processed", {
  recursive: true,
});

await writeFile(
  "data/processed/cards.min.json",
  JSON.stringify(simplified, null, 2),
  "utf8"
);

console.log(`Processed ${simplified.length} cards`);