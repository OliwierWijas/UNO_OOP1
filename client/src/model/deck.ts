import { DeckFactory } from '../utils/deck_factory'
import { standardShuffler } from '../utils/random_utils'
import type { Card } from './card'
import type { Type } from './types'

export interface Deck {
  cards: Card<Type>[]

  drawCards(nrCards: number): Card<Type>[]
  shuffle(): void
}

export function deck(): Deck {
  return {
    cards: DeckFactory.createFullDeck(),
    shuffle() {
      standardShuffler(this.cards)
    },

    drawCards(nrCards: number) {
      return this.cards.splice(0, nrCards)
    },
  }
}
