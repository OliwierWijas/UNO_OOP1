import type { Type } from './types'
import { RulesHelper } from '../utils/rules_helper'
import type { Card } from './card'
import type { Deck } from './deck'
import type { PlayerHand } from './playerHand'
import { discardPile, type DiscardPile } from './discardPile'

export interface Round {
  playerHands: PlayerHand[]
  deck: Deck | null
  currentPlayer: PlayerHand | undefined
  discardPile: DiscardPile
  isFinished: boolean

  nextPlayer(): void
  putCard(card: Card<Type>): boolean
}

export function round(hands: PlayerHand[]): Round {
  function findDealer(playerHands: PlayerHand[]): PlayerHand {
    return playerHands[0] ///we might change here later with the actual logic
  }

  return {
    playerHands: hands,
    deck: null,
    currentPlayer: undefined,
    discardPile: discardPile(),
    isFinished: false,

    nextPlayer() {
      if (!this.currentPlayer) {
        this.currentPlayer = findDealer(this.playerHands)
        return
      }

      const idx = this.playerHands.indexOf(this.currentPlayer)
      const nextIdx = (idx + 1) % this.playerHands.length
      this.currentPlayer = this.playerHands[nextIdx]
    },

    putCard(card: Card<Type>) : boolean {
      const lastCard = this.discardPile.getTopCard()

      if (this.currentPlayer && lastCard && RulesHelper.canBePutOnTop(lastCard, card)) {
        this.discardPile.addCard(card)

        if (this.currentPlayer.playerCards.length === 0) {
          this.isFinished = true
          const score = RulesHelper.calculateScore(this.playerHands)
          this.currentPlayer.addToScore(score)
          return true
        }

        switch (card.type) {
          case 'REVERSE':
            this.playerHands.reverse()
            this.nextPlayer()
            return true

          case 'SKIP':
            this.nextPlayer()
            this.nextPlayer()
            return true

          case 'DRAW2':
            this.nextPlayer()
            if (this.deck) {
              this.currentPlayer?.takeCards(this.deck.drawCards(2))
            }
            return true

          case 'DRAW4':
            this.nextPlayer()
            if (this.deck) {
              this.currentPlayer?.takeCards(this.deck.drawCards(4))
            }
            return true

          case 'WILD':
          case 'NUMBERED':
            this.nextPlayer()
            return true
        }
      }
      return false
    },
  }
}
