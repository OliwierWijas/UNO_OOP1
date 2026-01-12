<script setup lang="ts">
import { computed } from 'vue'
import UnoCard from "./Card.vue";
import type { Card } from "domain/src/model/card";
import { useCurrentPlayerStore } from '@/stores/CurrentPlayerStore';
import type { PlayerHandSubscription } from '@/model/uno-client';

const currentPlayerStore = useCurrentPlayerStore()

const props = defineProps<{
  playerHand: PlayerHandSubscription,
  cards: Card[]
}>()


const cards = computed(() => props.cards)
const currentHand = computed(() => props.playerHand);

const emit = defineEmits<{
  (e: 'play-card', payload: { cardIndex: number; card: Card }): void;
}>();

const isMyTurn = computed(
  () => currentPlayerStore.currentPlayer === props.playerHand.playerName
)

function playCard(index: number) {
  if (cards.value.length > index) {
    const card = cards.value[index]
    emit('play-card', { cardIndex: index, card });
  }
}

const spacing = 45
const cardWidth = 80

const cardStyle = (index : number) => {
  const total = currentHand.value.numberOfCards
  const groupWidth = cardWidth + spacing * (total - 1)
  const left = `calc(50% - ${groupWidth / 2 - index * spacing}px)`
  return {
    left,
    zIndex: index
  }
}


</script>
<template>
  <div class="player-hand">
    <div v-if="isMyTurn" class="hand-cards">
      <UnoCard
        v-for="(card, index) in cards"
        v-bind:key="index"
        v-bind:card="card"
        class="uno-card"
        v-bind:style="cardStyle(index)"
        @click="playCard(index)"
      />
    </div>

    <div v-else class="waiting-message">
      {{ currentPlayerStore.currentPlayer }} is playing...
    </div>
  </div>
</template>

<style scoped>
.player-hand {
  position: relative;
  width: 75%;                
  height: 12rem;   
}

.hand-cards {
  display: flex;
  height: 100%;
  align-items: flex-end; 
}

.uno-card {
  position: absolute;
  bottom: 0;
  transition: transform 0.3s ease; 
  cursor: pointer;
}

.uno-card:hover {
  transform: translateY(-2.5rem); 
  z-index: 50;
}

.waiting-message {
  color: white;
  font-size: 2rem;
  text-align: center;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-top: 0;
}

</style>
