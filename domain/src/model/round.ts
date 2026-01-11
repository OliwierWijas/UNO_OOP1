import { RulesHelper } from '../utils/rules_helper'
import type { Card } from './card'
import type { Deck } from './deck'
import type { PlayerHand } from './playerHand'
import { discardPile, type DiscardPile } from './discardPile'

function getCurrentPlayer(round: Round): PlayerHand | null {
  if (round.currentPlayerIndex === null) return null
  return round.playerHands[round.currentPlayerIndex] ?? null
}

type StartedRoundWithPlayer = {
  isFinished: false,
  currentPlayerIndex: number
}

export function isStartedWithPlayer(
  round: Round
): round is Round & StartedRoundWithPlayer {
  return round.isFinished === false && round.currentPlayerIndex !== null
}

// try to change the return type to boolean
function hasDeck(round: Round): round is Round & { deck: Deck } {
  return round.deck !== null
}

export interface Round {
  playerHands: PlayerHand[]
  deck: Deck | null
  currentPlayerIndex: number | null
  discardPile: DiscardPile
  isFinished: boolean

  nextPlayer(): void
  putCard(card: Card): boolean
  findDealer(): void
}

export function round(hands: PlayerHand[]): Round {
  return {
    playerHands: hands,
    deck: null,
    currentPlayerIndex: null,
    discardPile: discardPile(),
    isFinished: false,

    findDealer() {
      if (this.playerHands.length < 1) {
        throw new Error("Not enough players.")
      }

      this.currentPlayerIndex = 0
    },

    nextPlayer() {
      if (this.currentPlayerIndex === null) {
        this.findDealer()
        return
      }

      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerHands.length
    },

    putCard(card: Card) : boolean {
      if (this.currentPlayerIndex === null) return false

      const lastCard = this.discardPile.getTopCard()
      const currentPlayer = this.playerHands[this.currentPlayerIndex]

      if (!RulesHelper.canBePutOnTop(lastCard, card)) {
        return false
      }

      this.discardPile.addCard(card)

      if (currentPlayer.playerCards.length === 0) {
        this.isFinished = true
        const score = RulesHelper.calculateScore(this.playerHands)
        currentPlayer.addToScore(score)
        return true
      }

      switch (card.type) {
        case 'REVERSE':
          this.playerHands.reverse()
          // maintaining the same player
          this.currentPlayerIndex = this.playerHands.length - 1 - this.currentPlayerIndex
          this.nextPlayer()
          return true

        case 'SKIP':
          this.nextPlayer()
          this.nextPlayer()
          return true

        case 'DRAW2':
          this.nextPlayer()
          if (hasDeck(this)) {
            this.playerHands[this.currentPlayerIndex]
              .takeCards(this.deck.drawCards(2))
          }
          return true

        case 'DRAW4':
          this.nextPlayer()
          if (hasDeck(this)) {
            this.playerHands[this.currentPlayerIndex]
              .takeCards(this.deck.drawCards(4))
          }
          return true

        case 'WILD':
        case 'NUMBERED':
          this.nextPlayer()
          return true
      }
    },
  }
}
