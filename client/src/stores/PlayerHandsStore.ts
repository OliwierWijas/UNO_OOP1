import { computed, reactive, type Reactive } from 'vue'
import { defineStore } from 'pinia'
import type { PlayerHandSubscription } from '@/model/uno-client'

export const usePlayerHandsStore = defineStore('player hands', () => {
  const playerHandsList = reactive<PlayerHandSubscription[]>([])
  const playerHands = computed((): Reactive<Readonly<PlayerHandSubscription[]>> => playerHandsList)

  const update = (hands: PlayerHandSubscription[]) => {
    playerHandsList.length = 0
    playerHandsList.push(...hands)
  }
  const clear = () => {
    playerHandsList.length = 0
  }

  return { playerHands, update, clear }
})
