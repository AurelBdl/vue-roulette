<template>
  <section class="example">
    <div class="roulette-panel">
      <CasinoRoulette
        ref="rouletteRef"
        :items="items"
        :useColor="false"
        :enableTickSound="true"
        @select="onSelect"
        @spin-start="onSpinStart"
        @spin-end="onSpinEnd"
      />
      <div class="actions">
        <button type="button" @click="spin" :disabled="spinning">
          Spin
        </button>
        <button type="button" @click="stop" :disabled="!spinning">
          Brake
        </button>
        <button type="button" @click="reset">
          Reset
        </button>
      </div>
    </div>
    <div class="status">
      <p v-if="message">{{ message }}</p>
      <p v-if="selection">Last pick: <strong>{{ selection.label }}</strong></p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CasinoRoulette from './CasinoRoulette.vue'
import type { RouletteItem } from '../types'

const items: RouletteItem[] = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 }
]

const rouletteRef = ref<InstanceType<typeof CasinoRoulette> | null>(null)
const selection = ref<RouletteItem | null>(null)
const spinning = ref(false)
const message = ref('')

const spin = () => {
  rouletteRef.value?.spin()
}

const stop = () => {
  rouletteRef.value?.stop()
}

const reset = () => {
  rouletteRef.value?.reset()
  selection.value = null
  message.value = ''
}

const onSelect = (item: RouletteItem) => {
  selection.value = item
  message.value = `Winner: ${item.label}`
}

const onSpinStart = () => {
  spinning.value = true
  message.value = 'The wheel is spinning...'
}

const onSpinEnd = () => {
  spinning.value = false
}
</script>

<style scoped>
.example {
  display: grid;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.roulette-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  background: #111927;
  color: #f5f5f5;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.status {
  text-align: center;
  font-size: 1.1rem;
}

strong {
  color: #f39c12;
}
</style>
