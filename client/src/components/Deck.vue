<script setup lang="ts">
import type { Card } from '@/model/card';
import type { Type } from '@/model/types';
import deckImg from '@/components/images/Back_Card.png';
import type { Deck } from '@/model/deck';

const props = defineProps<{
  deck: Deck
}>();

const emit = defineEmits<{
  (e: 'card-drawn', card: Card<Type>): void
}>();


function drawCard() {
  const cards = props.deck.drawCards(1);
  if (cards.length > 0) {
    const drawn = cards[0];
    emit('card-drawn', drawn);
    return drawn;
  }
  return undefined;
}
</script>

<template>
  <div class="deck-container">
    <img
      :src="deckImg"
      alt="Deck"
      class="deck-image"
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
</style>
