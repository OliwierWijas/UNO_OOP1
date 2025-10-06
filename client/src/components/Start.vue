<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const playerName = ref("");

const canStart = computed(() => playerName.value.trim().length > 0);

function startGame() {
  if (!canStart.value) return;
  router.push({ name: "Game", query: { name: playerName.value } });
}
</script>

<template>
  <div class="start-page">
    <h1 class="title">UNO</h1>

    <input
      v-model="playerName"
      type="text"
      placeholder="Enter your name"
      class="name-input"
      @keyup.enter="startGame"
    />

    <button
      class="start-btn"
      :disabled="!canStart"
      @click="startGame"
    >
      Start Game
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');

.start-page {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh; 
  width : 100vw;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #6e91c2ff 0%, #0956bf 100%);
  background-size: cover;
}

.title {
  animation: none !important;  
  font-family: 'Luckiest Guy', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: clamp(56px, 9vw, 88px);
  color: #fff;
  margin: 0 0 3rem 0;
  letter-spacing: 1px;
  text-shadow:
    0 6px 16px rgba(0, 0, 0, 0.35),
    0 2px 0 rgba(0,0,0,0.25);
  display: inline-block;                
  transition: transform 180ms ease;     
  will-change: transform;
}

.title:hover {
  transform: scale(1.08);               
}

.name-input {
  width: 320px;
  max-width: 90vw;
  padding: 16px 18px;
  border: none;
  border-radius: 14px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #0f172a;
  background: #ffffff;
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.25),
    0 0 0 0 rgba(253, 224, 71, 0);
  outline: none;
  transition: box-shadow 160ms ease, transform 120ms ease;
}

.name-input::placeholder {
  color: #999;
}

.name-input:focus {
  transform: translateY(-1px);
  box-shadow:
    0 12px 22px rgba(0, 0, 0, 0.28),
    0 0 0 4px rgba(253, 224, 71, 0.55); 
}

.start-btn {
  margin-top: 32px;
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  font-size: 24px;
  font-weight: 800;
  cursor: pointer;
  background: #ffffff;
  color: #b91c1c;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.28);
  transform: translateZ(0) scale(1);
  transition: transform 140ms ease, background-color 140ms ease, color 140ms ease, box-shadow 140ms ease, filter 140ms ease;
}

.start-btn:hover {
  transform: scale(1.06);
  color:  #dc2626;   
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.32);
  filter: brightness(1.02);
}

.start-btn:active {
  filter: brightness(0.98);
}


.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #f8fafc;
  color: #64748b;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
}
</style>
