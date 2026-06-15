import { mkdir, writeFile } from "node:fs/promises";

const URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

async function main() {
  console.log("Downloading Yu-Gi-Oh card database...");

  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const json = await response.json();

  await mkdir("data/raw", {
    recursive: true,
  });

  await writeFile(
    "data/raw/cards.json",
    JSON.stringify(json, null, 2),
    "utf8"
  );

  console.log(`Downloaded ${json.data.length} cards`);
}

main().catch(console.error);