import { RulesHelper } from '../utils/rules_helper'
import type { Deck } from './deck'
import type { PlayerHand } from './playerHand'
import { round, type Round } from './round'

type FinishedGame = {
  state: "FINISHED"
  currentRoundIndex: null
}

type StartedGame = {
  state: "STARTED"
  currentRoundIndex: number
}

export function isFinished(game: Game): game is Game & FinishedGame { 
  return game.state === "FINISHED" && game.currentRoundIndex === null; 
}

export function isStarted(game: Game): game is Game & StartedGame { 
  return game.state === "STARTED" && game.currentRoundIndex !== null; 
}

export type GameState = "PENDING" | "STARTED" | "FINISHED"

export type Game = {
    name: string
    playerHands: PlayerHand[]
    rounds: Round[]
    state: GameState
    currentRoundIndex: number | null

    startGame(deck: Deck): void
    joinGame(playerHand: PlayerHand): void
    nextRound(deck: Deck): PlayerHand | undefined
  }

export function game(name: string): Game {
  return {
    name,
    playerHands: [],
    rounds: [],
    state: "PENDING",
    currentRoundIndex: null,

    startGame(deck) {
      if (this.state !== "PENDING") {
        throw new Error("Game already started.")
      }

      if (this.playerHands.length < 2) {
        throw new Error("Too few players.")
      }

      const firstRound = round(this.playerHands)
      firstRound.deck = deck

      this.rounds.push(firstRound)
      this.currentRoundIndex = this.rounds.length - 1
      this.state = "STARTED"
    },

    joinGame(playerHand) {
      if (this.state !== "PENDING") {
        throw new Error("Cannot join after game started.")
      }

      if (this.playerHands.length >= 4) {
        throw new Error("Too many players.")
      }

      this.playerHands.push(playerHand)
    },

    nextRound(deck) {
      if (this.state !== "STARTED") {
        throw new Error("The game is not in started state.")
      }

      if (this.currentRoundIndex === null) {
        throw new Error("No current round.")
      }

      const currentRound = this.rounds[this.currentRoundIndex]

      const winner = RulesHelper.checkIfAnyoneHasScore500(currentRound)
      if (winner) {
        currentRound.isFinished = true
        this.state = "FINISHED"
        this.currentRoundIndex = null
        return winner
      }

      if (currentRound.isFinished) {
        this.playerHands.forEach(p => p.resetCards())

        const next = round(this.playerHands)
        next.deck = deck

        this.rounds.push(next)
        this.currentRoundIndex = this.rounds.length - 1
      }

      return undefined
    },
  }
}
