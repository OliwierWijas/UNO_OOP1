import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from 'domain/src/model/card'

export const useCardsStore = defineStore('cards', () => {
  const cards = reactive<Card[]>([])

  const topCard = computed<Card | null>(() =>
    cards.length > 0
      ? cards[cards.length - 1]
      : null
  )

  const set = (newCards: Card[]) => {
    cards.length = 0
    cards.push(...newCards)
  }

  const push = (card: Card) => {
    cards.push(card)
  }

  const clear = () => {
    cards.length = 0
  }

  const restore = (index: number, card: Card) => {
    cards.splice(index, 0, card)
  }

  return {
    cards,
    topCard,
    set,
    push,
    clear,
    restore
  }
})
