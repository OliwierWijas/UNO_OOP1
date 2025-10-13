import { computed, reactive, type Reactive } from 'vue'
import { defineStore } from 'pinia'
import type { PlayerHand } from 'domain/src/model/playerHand'

export const usePlayerHandsStore = defineStore('player hands', () => {
  const playerHandsList = reactive<PlayerHand[]>([])
  const playerHands = computed((): Reactive<Readonly<PlayerHand[]>> => playerHandsList)

  const update = (hands: PlayerHand[]) => {
    playerHandsList.length = 0
    playerHandsList.push(...hands)
    playerHandsList.forEach(p => console.log(p.playerName + " " + p.playerCards))
  }
  const clear = () => {
    playerHandsList.length = 0
  }

  return { playerHands, update, clear }
})
