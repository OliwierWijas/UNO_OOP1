<script setup lang="ts">
import type { Card } from 'domain/src/model/card';
import deckImg from '@/components/images/Back_Card.png';
import * as api from "../model/uno-client";
import { computed, ref } from 'vue';
import { useCurrentPlayerStore } from '@/stores/CurrentPlayerStore';

const props = defineProps<{
  gameName: string,
  playerName: string
}>();

const emit = defineEmits<{
  (e: 'card-drawn', card: Card): void
}>();

const currentPlayerStore = useCurrentPlayerStore()
const isMyTurn = computed(
  () => currentPlayerStore.currentPlayer === props.playerName
)
const isDrawing = ref(false)
const canDraw = computed(() => isMyTurn.value && !isDrawing.value)

async function drawCard() {
  if (!canDraw.value) return

  isDrawing.value = true

  try {
    const cards = await api.take_cards(props.gameName, props.playerName, 1)
    const drawn = cards[0]
    emit("card-drawn", drawn)
  } finally {
    isDrawing.value = false
  }
}
</script>

<template>
  <div class="deck-container">
    <img
      :src="deckImg"
      alt="Deck"
      class="deck-image"
      :class="{ disabled: isDrawing }"
      @click="drawCard"
    />
  </div>
</template>

<style scoped>
.deck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem; 
}

.deck-image {
  height: 14rem; 
  object-fit: contain; 
  cursor: pointer;
  border-radius: 0.375rem; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  transition: transform 0.3s; 

}

.deck-image:hover {
  transform: scale(1.1); 
}

.deck-image.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
