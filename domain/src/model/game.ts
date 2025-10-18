import { RulesHelper } from '../utils/rules_helper'
import type { Deck } from './deck'
import type { PlayerHand } from './playerHand'
import { round, type Round } from './round'
import { State } from './state'

export interface Game {
  name: string
  playerHands: PlayerHand[]
  rounds: Round[]
  currentRound: Round | undefined
  state: State

  startGame(deck: Deck): void
  joinGame(playerHand: PlayerHand): void
  nextRound(deck: Deck): PlayerHand | undefined
}

export function game(name: string): Game {
  return {
    name,
    playerHands: [],
    rounds: [],
    currentRound: undefined,
    state: "PENDING",

    startGame(deck: Deck) {
      if (this.playerHands.length < 2) 
        throw new Error("Too less players.")

      const firstRound = round(this.playerHands)
      firstRound.deck = deck
      this.rounds.push(firstRound)
      this.currentRound = firstRound
      this.state = "STARTED"
    },

    joinGame(playerHand: PlayerHand) {
      if (this.playerHands.length >= 4)
        throw new Error("Too many players.")
      this.playerHands.push(playerHand)
    },

    nextRound(deck: Deck) {
      if (this.state === "STARTED") {
          if (!this.currentRound) return; 

          const winner = RulesHelper.checkIfAnyoneHasScore500(this.currentRound)
          if (winner)
          {
              this.currentRound.isFinished = true;
              return winner;
          }

          if(this.currentRound?.isFinished) {
              this.playerHands.forEach(p => {
                  p.resetCards()
              });
              
              const nextRound = round(this.playerHands);
              nextRound.deck = deck
              this.rounds.push(nextRound);
              this.currentRound = nextRound;
          }
          
          return undefined;
      }
      else {
          throw new Error("The game is not in started state.")
      }
    },
  }
}
