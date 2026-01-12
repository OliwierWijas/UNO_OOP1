<script setup lang="ts">
import { useDiscardPileStore } from '@/stores/DiscardPileStore';
import UnoCard from './Card.vue';
import { computed } from 'vue';

const discardPileStore = useDiscardPileStore();

const topCard = computed(() => discardPileStore.topCard)
const hasTopCard = computed(() => topCard.value !== null)

</script>

<template>
  <div class="discard-pile">
    <UnoCard v-if="hasTopCard" :card="topCard" />

    <div
      v-else
      class="empty-space"
      data-testid="empty-discard-pile"
    />
  </div>
</template>

<style>
.discard-pile {
  display: flex;
  justify-content: center;
}

.empty-space {
  height: 14rem;
  width: 9.4rem;
}
</style>