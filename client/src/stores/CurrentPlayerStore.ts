import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCurrentPlayerStore = defineStore('current player', () => {
  const currentPlayerName = ref<string | null>(null)

  const currentPlayer = computed(() => currentPlayerName.value)

  const set = (playerName: string) => {
    currentPlayerName.value = playerName
  }

  const clear = () => {
    currentPlayerName.value = null
  }

  return {
    currentPlayer,
    set,
    clear
  }
})
