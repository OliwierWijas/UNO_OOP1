<script setup lang="ts">
import type { Card } from "domain/src/model/card";
import type { Type } from "domain/src/model/types";
import { computed, type PropType } from "vue";

const props = defineProps({
  card: {
    type: Object as PropType<Card<Type>>,
    required: true
  }
})

function isColoredCard(card: Card<Type>): card is Extract<Card<Type>, { color: string }> {
  return 'color' in card;
}

function isNumberedCard(card: Card<Type>): card is Extract<Card<Type>, { type: 'NUMBERED'; number: number }> {
  return card.type === 'NUMBERED';
}

const numberedImageMap: Record<Extract<Type, 'NUMBERED'>, (card: Extract<Card<Type>, {color : string, number: number}>) => string> = {
  NUMBERED: (card) => `/src/components/images/${card.color}_${card.number}.png`,
}

const coloredImageMap: Record<Exclude<Type, 'WILD' | 'DRAW4' | 'NUMBERED'>, (card: Extract<Card<Type>, { color: string }>) => string> = {
  SKIP: (card) => `/src/components/images/${card.color}_Skip.png`,
  REVERSE: (card) => `/src/components/images/${card.color}_Reverse.png`,
  DRAW2: (card) => `/src/components/images/${card.color}_Draw_2.png`,
};

const wildImageMap: Record<'WILD' | 'DRAW4', string> = {
  WILD: `/src/components/images/Wild_Card_Change_Colour.png`,
  DRAW4: `/src/components/images/Wild_Card_Draw_4.png`,
};

const cardImage = computed(() => {
  const card = props.card;
  if (isNumberedCard(card)) {
    return numberedImageMap[card.type](card);
  }
  else if (isColoredCard(card)) {
    return coloredImageMap[card.type](card);
  } 
  else {
    return wildImageMap[card.type as 'WILD' | 'DRAW4'];
  }
});
</script>

<template>
  <div class="card-container">
    <img :src="cardImage" alt="UNO Card" class="card-image" />
  </div>
</template>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  
}

.card-image {
  height: 14rem;
  object-fit: contain;
  cursor: pointer;
  border-radius:15px; 
  transition: transform 0.3s;
}
.card-image:hover {
  transform: scale(1.1); 
}
</style>
