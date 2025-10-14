import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DiscardPile } from 'domain/src/model/discardPile'

export const useDiscardPileStore = defineStore('discardPile', () => {
  const discardPile = ref<DiscardPile | null>(null)

  const pile = computed(() => discardPile.value?.pile ?? [])

  const topCard = computed(() => pile.value[pile.value.length - 1] ?? null)

  const set = (newDiscardPile: DiscardPile) => {
    discardPile.value = newDiscardPile
  }

  return {
    pile,
    topCard,
    set
  }
})
