import { DeckFactory } from '../utils/deck_factory'
import { standardShuffler } from '../utils/random_utils'
import type { Card } from './card'

type NonEmptyCards = readonly [Card, ...Card[]]

export interface Deck {
  readonly cards: ReadonlyArray<Card>

  drawCards(nrCards: number): Card[]
  shuffle(): void
}

function hasCards(cards: ReadonlyArray<Card>): cards is NonEmptyCards {
  return cards.length > 0
}

export function deck(): Deck {
  const cards: Card[] = DeckFactory.createFullDeck()
  
  return {
    get cards() {
      return cards
    },

    shuffle() {
      if (hasCards(cards)) {
        standardShuffler(cards)
      }
    },

    drawCards(nrCards) {
      if (!hasCards(cards)) {
        return []
      }

      return cards.splice(0, nrCards)
    },
  }
}
