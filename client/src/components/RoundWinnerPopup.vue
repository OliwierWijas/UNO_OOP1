<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  winner: string
  score: number
}>()

const emit = defineEmits<{
  (e: 'next-round'): void
}>()

function handleNextRound() {
  emit('next-round')
}
</script>

<template>
  <div class="round-winner-popup">
    <h2>🎉 Round Winner: {{ winner }} 🎉</h2>
    <p>Score: {{ score }}</p>
    <button @click="handleNextRound">Next Round</button>
  </div>
</template>

<style scoped>
.round-winner-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.85);
  padding: 2rem 3rem;
  border-radius: 1rem;
  color: white;
  text-align: center;
  z-index: 1000;
}

.round-winner-popup button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  background: #4CAF50;
  color: white;
}

.round-winner-popup button:hover {
  background: #45a049;
}
</style>
