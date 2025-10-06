import type { Card } from './card';
import type { Type } from './types';

export interface DiscardPile {
  pile: Card<Type>[];

  addCard(card: Card<Type>): void;
  getTopCard(): Card<Type> | undefined;
  reset(): void;
}

export function discardPile(): DiscardPile {
  return {
    pile: [],

    addCard(card: Card<Type>) {
      this.pile.push(card);
      console.log(card)
    },

    getTopCard() {
      return this.pile.length > 0 ? this.pile[this.pile.length - 1] : undefined;
    },

    reset() {
      this.pile = [];
    },
  };
}
