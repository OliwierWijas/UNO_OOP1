<script setup lang="ts">
import { type PropType, defineProps, defineEmits, computed } from 'vue'
import type { PlayerHand } from "domain/src/model/playerHand";
import UnoCard from "./Card.vue";
import type { Card } from "domain/src/model/card";
import type { Type } from "domain/src/model/types";
import { useCurrentPlayerStore } from '@/stores/CurrentPlayerStore';

const currentPlayerStore = useCurrentPlayerStore()

const props = defineProps({
  playerHand: {
    type: Object as PropType<PlayerHand>,
    required: true
  }
});

const currentHand = computed(() => props.playerHand);

const emit = defineEmits<{
  (e: 'card-played', payload: { cardIndex: number; card: Card<Type> }): void;
}>();

function playCard(index: number) {
  console.log(currentHand.value.playerCards)
  const card = currentHand.value.playCard(index)
  console.log(card)
  emit('card-played', { cardIndex: index, card });
}

const spacing = 45
const cardWidth = 80

const cardStyle = (index : number) => {
  const total = props.playerHand.playerCards.length
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
    <div v-if="currentPlayerStore.currentPlayer === props.playerHand.playerName" class="hand-cards">
      <UnoCard
        v-for="(card, index) in currentHand.playerCards"
        :key="index"
        :card="card"
        class="uno-card"
        :style="cardStyle(index)"
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
