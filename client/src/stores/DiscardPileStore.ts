import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from 'domain/src/model/card'

export const useDiscardPileStore = defineStore('discardPile', () => {
  const pile = ref<Card[]>([])

  const topCard = computed(() =>
    pile.value.length > 0 ? pile.value[pile.value.length - 1] : null
  )
  const set = (cards: Card[]) => {
    pile.value = [...cards]
  }

  return {
    pile,
    topCard,
    set
  }
})
