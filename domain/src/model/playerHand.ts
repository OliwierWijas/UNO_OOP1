import type { Card } from "./card";
import type { Type } from "./types";

export interface PlayerHand {
  playerName: string;
  playerCards: Card<Type>[];
  score: number;

  putCardBack(card: Card<Type>, index: number): void;
  takeCards(cards: Card<Type>[]): void;
  playCard(index: number): Card<Type>;
  addToScore(points: number): void;
  resetCards(): void;
}

export function playerHand(name: string): PlayerHand {
  let playerCards: Card<Type>[] = [];
  let score = 0;

  return {
    playerName: name,

    get playerCards() {
      return playerCards;
    },

    score: score,

    putCardBack(card: Card<Type>, index: number): void {
      if (index < 0) index = 0;
      if (index > playerCards.length) index = playerCards.length;

      playerCards.splice(index, 0, card);
    },

    takeCards(cards: Card<Type>[]) {
      playerCards.push(...cards);
    },

    playCard(index: number): Card<Type> {
      return playerCards.splice(index, 1)[0];
    },

    addToScore(points: number) {
      score += points;
    },

    resetCards() {
      playerCards = [];
    },
  };
}
