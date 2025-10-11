import type { Card } from '../model/card'
import type { PlayerHand } from '../model/playerHand'
import type { Round } from '../model/round'
import type { Type } from '../model/types'

export class RulesHelper {
  static canBePutOnTop(topCard: Card<Type> | undefined, chosenCard: Card<Type> | undefined): boolean {
    if(topCard === undefined) {
      return true;
    }

    if (chosenCard === undefined) {
      throw new Error("Undefined card cannot be put in the discard pile.");
    }

    // Wild cards can always be played
    if (chosenCard.type === 'WILD' || chosenCard.type === 'DRAW4') {
      return true
    }

    //we can put whatever color on WILD or DRAW4 cards
    if (topCard.type === 'WILD' || topCard.type === 'DRAW4') {
      return true
    }

    // Same color always allowed
    if (chosenCard.color && topCard.color && chosenCard.color === topCard.color) {
      return true
    }

    // Rules by card type
    switch (topCard.type) {
      case 'NUMBERED':
        // Numbered: match by number
        return chosenCard.type === 'NUMBERED' && chosenCard.number === topCard.number

      case 'SKIP':
      case 'REVERSE':
        // Action: match by type
        return chosenCard.type === topCard.type
    }

    return false
  }

  static canSayUno(playerHand: PlayerHand): boolean {
    return playerHand.playerCards.length === 1
  }

  static calculateScore(hands: PlayerHand[]): number {
    var totalScore = 0
    hands.forEach((hand) => {
      const points = hand.playerCards.reduce((sum, card) => {
        switch (card.type) {
          case 'NUMBERED':
            return sum + (card.number ?? 0)
          case 'DRAW2':
          case 'REVERSE':
          case 'SKIP':
            return sum + 20
          case 'WILD':
          case 'DRAW4':
            return sum + 50
          default:
            return sum
        }
      }, 0)

      totalScore += points
    })
    return totalScore
  }

  static checkIfAnyoneHasScore500(currentRound: Round): PlayerHand | undefined {
    currentRound.playerHands.forEach(p => {
      if (p.score >= 500)
        return p
    })

    return undefined
  }
}
