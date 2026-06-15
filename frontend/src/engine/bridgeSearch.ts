import type { Card } from "../types/card";

export function findBridgeMonsters(
  target: Card,
  cards: Card[]
): Card[] {
  return cards.filter((card) => {
    if (card === target) {
      return false;
    }

    if (card.attribute !== target.attribute) {
      return false;
    }

    if (card.race !== target.race) {
      return false;
    }

    if (target.level == null || card.level == null) {
      return false;
    }

    if (card.level === target.level) {
      return false;
    }

    return true;
  });
}