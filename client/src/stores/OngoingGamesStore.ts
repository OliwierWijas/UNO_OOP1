import { computed, reactive, type Reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Game } from 'domain/src/model/game'

export const useOngoingGamesStore = defineStore('ongoing games', () => {
  const ongoingGamesList = reactive<Game[]>([])
  const ongoingGames = computed((): Reactive<Readonly<Game[]>> => ongoingGamesList)
  const addGame = (game: Game) => {
    if (!ongoingGamesList.find(g => g.name === game.name)) {
      ongoingGamesList.push(game)
    }
  }
  const removeGame = (gameName: string) => {
    const index = ongoingGamesList.findIndex(g => g.name === gameName)
    if (index !== -1) {
      ongoingGamesList.splice(index, 1)
    }
  }
  const updateGame = (game: Game) => {
    const index = ongoingGamesList.findIndex(g => g.name === game.name)
    if (index !== -1) {
      ongoingGamesList[index] = game
    } else {
      addGame(game)
    }
  }

  const getGame = (gameName: string) => {
    return ongoingGamesList.find(g => g.name === gameName)
  }
  const isGameOngoing = (gameName: string) => {
    return ongoingGamesList.some(g => g.name === gameName)
  }

  const clear = () => {
    ongoingGamesList.length = 0
  }

  return {
    ongoingGames,
    addGame,
    removeGame,
    updateGame,
    getGame,
    isGameOngoing,
    clear
  }
})
