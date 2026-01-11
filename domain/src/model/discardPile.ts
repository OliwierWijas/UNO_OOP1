import type { Card } from './card'

type NonEmptyPile = readonly [Card, ...Card[]]

function hasCards(pile: readonly Card[]): pile is NonEmptyPile {
  return pile.length > 0
}

export interface DiscardPile {
  readonly pile: ReadonlyArray<Card>

  addCards(card: Card[]): void
  addCard(card: Card): void
  getTopCard(): Card | undefined
  reset(): void
}

export function discardPile(): DiscardPile {
  const pile: Card[] = []

  return {
    get pile() {
      return pile
    },

    addCards(cards: Card[]) {
      pile.push(...cards)
    },

    addCard(card) {
      pile.push(card)
    },

    getTopCard() {
      if (!hasCards(pile)) {
        return undefined
      }

      return pile[pile.length - 1]
    },

    reset() {
      pile.length = 0
    },
  }
}
