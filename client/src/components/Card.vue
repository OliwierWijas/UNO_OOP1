<script setup lang="ts">
import { isColoredCard, isNumberedCard, type ActionCard, type ActionType, type Card, type NumberedCard, type WildType } from "domain/src/model/card";
import { computed, type PropType } from "vue";

const props = defineProps({
  card: {
    type: Object as PropType<Card>,
    required: true
  }
})

const numberedImageMap: Record<NumberedCard["type"], (card: NumberedCard) => string> = {
  NUMBERED: (card) =>
    `/src/components/images/${card.color}_${card.number}.png`,
}

const coloredImageMap: Record<ActionType, (card: ActionCard) => string> = {
  SKIP: (card) =>
    `/src/components/images/${card.color}_Skip.png`,
  REVERSE: (card) =>
    `/src/components/images/${card.color}_Reverse.png`,
  DRAW2: (card) =>
    `/src/components/images/${card.color}_Draw_2.png`,
}

const wildImageMap: Record<WildType, string> = {
  WILD: `/src/components/images/Wild_Card_Change_Colour.png`,
  DRAW4: `/src/components/images/Wild_Card_Draw_4.png`,
}


const cardImage = computed(() => {
  const card = props.card;
  if (isNumberedCard(card)) {
    return numberedImageMap[card.type](card);
  }
  else if (isColoredCard(card)) {
    return coloredImageMap[card.type](card);
  } 
  else {
    return wildImageMap[card.type]
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
