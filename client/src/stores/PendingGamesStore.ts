import { computed, reactive, type Reactive } from 'vue'
import { defineStore } from 'pinia'
import type { SimpleGameDTO } from '@/model/uno-client'

export const usePendingGamesStore = defineStore('pending games', () => {
  const gameList = reactive<SimpleGameDTO[]>([])
  const games = computed((): Reactive<Readonly<SimpleGameDTO[]>> => gameList)

  const upsert = (games: SimpleGameDTO[]) => {
    gameList.length = 0
    gameList.push(...games)
  }

  return { games, upsert }
})
