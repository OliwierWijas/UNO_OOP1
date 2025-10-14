<script setup lang="ts">
import { useDiscardPileStore } from '@/stores/DiscardPileStore';
import UnoCard from './Card.vue';

const discardPileStore = useDiscardPileStore();

</script>

<template>
  <div>
    <div v-if="discardPileStore.topCard">
      <UnoCard :card="discardPileStore.topCard" />
    </div>
    <div v-else >
      <div class= "empty-space"></div>
    </div>
  </div>
</template>

<style>
.empty-space {
  height: 14rem;
  width: 9.4rem
}
</style>
