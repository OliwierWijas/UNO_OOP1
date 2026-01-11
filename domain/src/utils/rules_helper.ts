import type { Card, ColoredCard } from '../model/card'
import type { PlayerHand } from '../model/playerHand'
import type { Round } from '../model/round'

function isColoredCard(card: Card): card is ColoredCard {
  return card.type !== 'WILD' && card.type !== 'DRAW4'
}

export class RulesHelper {
  static canBePutOnTop(topCard: Card | undefined, chosenCard: Card | undefined): boolean {
    if(!topCard) {
      return true;
    }

    if (!chosenCard) {
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
    if (isColoredCard(chosenCard) && isColoredCard(topCard) && chosenCard.color === topCard.color) {
      return true
    }

    // Rules by card type
    switch (topCard.type) {
      case 'NUMBERED':
        // match by number
        return chosenCard.type === 'NUMBERED' && chosenCard.number === topCard.number

      case 'SKIP':
      case 'REVERSE':
        // match by type
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
            return sum + card.number
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
    return currentRound.playerHands.find(p => p.score >= 500)
  }
}
