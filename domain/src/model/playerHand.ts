import type { Card } from './card'

type NonEmptyMutableCards = [Card, ...Card[]]

function hasCards(cards: readonly Card[]): cards is NonEmptyMutableCards {
  return cards.length > 0
}

function isValidIndex(cards: readonly Card[], index: number): boolean {
  return index >= 0 && index < cards.length
}

export interface PlayerHand {
  readonly playerName: string
  readonly playerCards: ReadonlyArray<Card>
  readonly score: number

  putCardBack(card: Card, index: number): void
  takeCards(cards: readonly Card[]): void
  playCard(index: number): Card | undefined
  addToScore(points: number): void
  resetCards(): void
}

export function playerHand(name: string): PlayerHand {
  let score = 0
  const cards: Card[] = []

  return {
    playerName: name,

    get playerCards() {
      return cards
    },

    get score() {
      return score
    },

    putCardBack(card, index) {
      const safeIndex =
        index < 0 ? 0 :
        index > cards.length ? cards.length :
        index

      cards.splice(safeIndex, 0, card)
    },

    takeCards(newCards) {
      cards.push(...newCards)
    },

    playCard(index) {
      if (!hasCards(cards) || !isValidIndex(cards, index)) {
        return undefined
      }

      return cards.splice(index, 1)[0]
    },

    addToScore(points) {
      score += points
    },

    resetCards() {
      cards.length = 0
    },
  }
}
