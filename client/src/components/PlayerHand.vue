<script setup lang="ts">
import { type PropType, ref, defineProps, defineEmits } from 'vue'
import type { PlayerHand } from "@/model/playerHand";
import UnoCard from "./Card.vue";
import type { Card } from "@/model/card";
import type { Type } from "@/model/types";

const props = defineProps({
  playerHand: {
    type: Object as PropType<PlayerHand>,
    required: true
  }
});

const currentHand = ref(props.playerHand);

const emit = defineEmits<{
  (e: 'card-played', payload: { cardIndex: number; card: Card<Type> }): void;
}>();

function playCard(index: number) {
  const card = currentHand.value.playCard(index)
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
    <div class="hand-cards">
      <UnoCard
        v-for="(card, index) in playerHand.playerCards"
        :key="index"
        :card="card"
        class="uno-card"
        :style="cardStyle(index)"
        @click="playCard(index)"
      />
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
</style>
