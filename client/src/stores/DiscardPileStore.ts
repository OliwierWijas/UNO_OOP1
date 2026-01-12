import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from 'domain/src/model/card'

export const useDiscardPileStore = defineStore('discardPile', () => {
  const pile = reactive<Card[]>([])

  const topCard = computed(() =>
    pile.length > 0 ? pile[pile.length - 1] : null
  )
  const set = (cards: Card[]) => {
    pile.length = 0
    pile.push(...cards)
  }

  return {
    pile,
    topCard,
    set
  }
})
