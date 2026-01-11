import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from 'domain/src/model/card'

export const useCardsStore = defineStore('cards', () => {
  const cards = ref<Card[]>([])

  const topCard = computed<Card | null>(() =>
    cards.value.length > 0
      ? cards.value[cards.value.length - 1]
      : null
  )

  const set = (newCards: Card[]) => {
    cards.value = [...newCards]
  }

  const push = (card: Card) => {
    cards.value.push(card)
  }

  const clear = () => {
    cards.value = []
  }

  return {
    cards,
    topCard,
    set,
    push,
    clear
  }
})
