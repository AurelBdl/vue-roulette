<template>
  <main class="app">
    <h1>Casino Roulette</h1>
    <p>
      Composant Vue 3 réutilisable pour afficher une roue façon casino.
      Utilisez les boutons ci-dessous pour déclencher les méthodes exposées.
    </p>
    <Example />
  </main>
</template>

<script setup lang="ts">
import Example from './components/Example.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(circle at top, #1f2937, #0b101a);
  color: #eef2ff;
  text-align: center;
}

h1 {
  font-size: 2.4rem;
}

p {
  max-width: 640px;
  line-height: 1.5;
}
</style>
