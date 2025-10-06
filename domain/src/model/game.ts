import { RulesHelper } from '@/utils/rules_helper'
import type { Deck } from './deck'
import type { PlayerHand } from './playerHand'
import { round, type Round } from './round'

export interface Game {
  rounds: Round[]
  currentRound: Round | undefined
  isGameFinished: boolean

  startGame(deck: Deck): void
  nextRound(deck: Deck): PlayerHand | undefined
}

export function game(playerHands: PlayerHand[]): Game {
  return {
    rounds: [],
    currentRound: undefined,
    isGameFinished: false,

    startGame(deck: Deck) {
      const firstRound = round(playerHands, deck)
      this.rounds.push(firstRound)
      this.currentRound = firstRound
    },

    nextRound(deck: Deck) {
      if (!this.isGameFinished) {
          if (!this.currentRound) return; 

          const winner = RulesHelper.checkIfAnyoneHasScore500(this.currentRound)
          if (winner)
          {
              this.currentRound.isFinished = true;
              return winner;
          }

          if(this.currentRound?.isFinished) {
              playerHands.forEach(p => {
                  p.resetCards()
              });
              
              const nextRound = round(playerHands, deck);
              this.rounds.push(nextRound);
              this.currentRound = nextRound;
          }
          
          return undefined;
      }
      else {
          throw new Error("The game has finished.")
      }
    }
  }
}
