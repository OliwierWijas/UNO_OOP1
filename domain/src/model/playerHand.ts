import { ref } from "vue";
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

export function playerHand(name: string, initialCards: Card<Type>[]): PlayerHand {
  const playerCards = ref<Card<Type>[]>([...initialCards]);
  const score = ref(0);

  return {
    playerName: name,

    get playerCards() {
      return playerCards.value;
    },

    score: score.value,

    putCardBack(card: Card<Type>, index: number): void {
      if (index < 0) index = 0;
      if (index > playerCards.value.length) index = playerCards.value.length;

      playerCards.value.splice(index, 0, card);
    },

    takeCards(cards: Card<Type>[]) {
      playerCards.value.push(...cards);
    },

    playCard(index: number): Card<Type> {
      return playerCards.value.splice(index, 1)[0];
    },

    addToScore(points: number) {
      score.value += points;
    },

    resetCards() {
      playerCards.value = [];
    },
  };
}
