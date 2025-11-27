<template>
  <section class="example">
    <div class="container">
      <div class="roulette-panel">
        <div class="header">
          <h1>Vue Roulette</h1>
          <p>Vue 3 reusable component to display a casino-style wheel. Use the buttons below to trigger the exposed methods.</p>
        </div>
        <VueRoulette
          ref="rouletteRef"
          :items="items"
          :size="config.size"
          :spinDuration="config.spinDuration"
          :useColor="config.useColor"
          :enableTickSound="config.enableTickSound"
          :tickSoundVolume="config.tickSoundVolume"
          :centerHoleRatio="config.centerHoleRatio"
          :spinOnClick="config.spinOnClick"
          :initialAngle="config.initialAngle"
          :initialVelocity="config.initialVelocity"
          :pointerPosition="config.pointerPosition"
          :pointerOptions="pointerOptions"
          @select="onSelect"
          @spin-start="onSpinStart"
          @spin-end="onSpinEnd"
        />
        <div class="actions">
          <button type="button" @click="spin" :disabled="spinning">Spin</button>
          <button type="button" @click="stop" :disabled="!spinning">Brake</button>
          <button type="button" @click="reset">Reset</button>
        </div>
        <div class="status">
          <p v-if="message">{{ message }}</p>
          <p v-if="selection">
            Last pick: <strong>{{ selection.label }}</strong>
          </p>
        </div>
      </div>

      <div class="controls">
        <h2>Configuration</h2>

        <!-- Items Management -->
        <div class="control-group">
          <h3>Items</h3>
          <div class="items-list">
            <div v-for="(item, index) in items" :key="index" class="item-row">
              <input
                v-model="item.label"
                type="text"
                placeholder="Label"
                class="input-small"
              />
              <input
                v-if="config.useColor"
                v-model="item.color"
                type="color"
                class="input-color"
              />
              <button type="button" @click="removeItem(index)" class="btn-remove">
                ✕
              </button>
            </div>
          </div>
          <button type="button" @click="addItem" class="btn-add">
            + Add Item
          </button>
        </div>

        <!-- Wheel Configuration -->
        <div class="control-group">
          <h3>Wheel</h3>
          <label>
            <span>Size: {{ config.size }}px</span>
            <input
              v-model.number="config.size"
              type="range"
              min="200"
              max="600"
              step="50"
            />
          </label>
          <label>
            <span>Spin Duration: {{ config.spinDuration }}ms</span>
            <input
              v-model.number="config.spinDuration"
              type="range"
              min="1000"
              max="8000"
              step="500"
            />
          </label>
          <label>
            <span>Initial Velocity: {{ config.initialVelocity }}</span>
            <input
              v-model.number="config.initialVelocity"
              type="range"
              min="500"
              max="5000"
              step="100"
            />
          </label>
          <label>
            <span>Initial Angle: {{ config.initialAngle }}°</span>
            <input
              v-model.number="config.initialAngle"
              type="range"
              min="0"
              max="360"
              step="15"
            />
          </label>
          <label>
            <span>Center Hole Ratio: {{ config.centerHoleRatio.toFixed(2) }}</span>
            <input
              v-model.number="config.centerHoleRatio"
              type="range"
              min="0"
              max="0.5"
              step="0.05"
            />
          </label>
          <label class="checkbox">
            <input v-model="config.useColor" type="checkbox" />
            <span>Use Custom Colors</span>
          </label>
          <label class="checkbox">
            <input v-model="config.spinOnClick" type="checkbox" />
            <span>Spin on Click</span>
          </label>
        </div>

        <!-- Sound Configuration -->
        <div class="control-group">
          <h3>Sound</h3>
          <label class="checkbox">
            <input v-model="config.enableTickSound" type="checkbox" />
            <span>Enable Tick Sound</span>
          </label>
          <label v-if="config.enableTickSound">
            <span>Volume: {{ (config.tickSoundVolume * 100).toFixed(0) }}%</span>
            <input
              v-model.number="config.tickSoundVolume"
              type="range"
              min="0"
              max="1"
              step="0.05"
            />
          </label>
        </div>

        <!-- Pointer Configuration -->
        <div class="control-group">
          <h3>Pointer</h3>
          <label>
            <span>Position</span>
            <select v-model="config.pointerPosition">
              <option value="top">Top</option>
              <option value="right">Right</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
            </select>
          </label>
          <label class="checkbox">
            <input v-model="pointerConfig.visible" type="checkbox" />
            <span>Visible</span>
          </label>
          <label v-if="pointerConfig.visible">
            <span>Color</span>
            <input v-model="pointerConfig.color" type="color" />
          </label>
          <label v-if="pointerConfig.visible">
            <span>Width: {{ pointerConfig.width }}px</span>
            <input
              v-model.number="pointerConfig.width"
              type="range"
              min="10"
              max="60"
              step="2"
            />
          </label>
          <label v-if="pointerConfig.visible">
            <span>Length: {{ pointerConfig.length }}px</span>
            <input
              v-model.number="pointerConfig.length"
              type="range"
              min="20"
              max="80"
              step="2"
            />
          </label>
        </div>

        <!-- Code Generator -->
        <div class="control-group">
          <h3>Generated Code</h3>
          <div class="code-editor">
            <button type="button" @click="copyCode" class="btn-copy">
              {{ copied ? '✓ Copied!' : 'Copy' }}
            </button>
            <pre><code>{{ generatedCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { RouletteItem } from "../types";
import { VueRoulette } from "../index";

const items = ref<RouletteItem[]>([
  { label: "10", value: 10, color: "#f39c12" },
  { label: "25", value: 25, color: "#8e44ad" },
  { label: "50", value: 50, color: "#16a085" },
  { label: "100", value: 100, color: "#d35400" },
  { label: "200", value: 200, color: "#c0392b" },
]);

const config = ref({
  size: 400,
  spinDuration: 4000,
  useColor: false,
  enableTickSound: true,
  tickSoundVolume: 0.15,
  centerHoleRatio: 0.28,
  spinOnClick: false,
  initialAngle: 0,
  initialVelocity: 2000,
  pointerPosition: "top" as "top" | "right" | "bottom" | "left",
});

const pointerConfig = ref({
  visible: true,
  color: "#ffffff",
  width: 26,
  length: 38,
});

const pointerOptions = computed(() => ({
  visible: pointerConfig.value.visible,
  color: pointerConfig.value.color,
  width: pointerConfig.value.width,
  length: pointerConfig.value.length,
}));

const rouletteRef = ref<any>(null);
const selection = ref<RouletteItem | null>(null);
const spinning = ref(false);
const message = ref("");
const copied = ref(false);

const spin = () => {
  rouletteRef.value?.spin();
};

const stop = () => {
  rouletteRef.value?.stop();
};

const reset = () => {
  rouletteRef.value?.reset();
  selection.value = null;
  message.value = "";
};

const addItem = () => {
  const colors = ["#f39c12", "#8e44ad", "#16a085", "#d35400", "#c0392b", "#27ae60"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  items.value.push({
    label: `Item ${items.value.length + 1}`,
    value: items.value.length + 1,
    color: randomColor,
  });
};

const removeItem = (index: number) => {
  if (items.value.length > 2) {
    items.value.splice(index, 1);
  }
};

const onSelect = (item: RouletteItem) => {
  selection.value = item;
  message.value = `Winner: ${item.label}`;
};

const onSpinStart = () => {
  spinning.value = true;
  message.value = "The wheel is spinning...";
};

const onSpinEnd = () => {
  spinning.value = false;
};

const generatedCode = computed(() => {
  let code = `<VueRoulette
  ref="rouletteRef"
  :items="items"`;
  
  // Add props only if they differ from defaults
  if (config.value.size !== 400) {
    code += `\n  :size="${config.value.size}"`;
  }
  if (config.value.spinDuration !== 4000) {
    code += `\n  :spin-duration="${config.value.spinDuration}"`;
  }
  if (config.value.useColor !== false) {
    code += `\n  :use-color="${config.value.useColor}"`;
  }
  if (config.value.initialVelocity !== 2000) {
    code += `\n  :initial-velocity="${config.value.initialVelocity}"`;
  }
  if (config.value.initialAngle !== 0) {
    code += `\n  :initial-angle="${config.value.initialAngle}"`;
  }
  if (config.value.enableTickSound !== false) {
    code += `\n  :enable-tick-sound="${config.value.enableTickSound}"`;
  }
  if (config.value.tickSoundVolume !== 0.15) {
    code += `\n  :tick-sound-volume="${config.value.tickSoundVolume}"`;
  }
  if (config.value.centerHoleRatio !== 0.28) {
    code += `\n  :center-hole-ratio="${config.value.centerHoleRatio}"`;
  }
  if (config.value.spinOnClick !== false) {
    code += `\n  :spin-on-click="${config.value.spinOnClick}"`;
  }
  if (config.value.pointerPosition !== 'top') {
    code += `\n  pointer-position="${config.value.pointerPosition}"`;
  }
  if (JSON.stringify(pointerOptions.value) !== JSON.stringify({ visible: true, color: '#ffffff', width: 26, length: 38 })) {
    code += `\n  :pointer-options="pointerOptions"`;
  }
  
  code += `\n  @select="onSelect"`;
  code += `\n  @spin-start="onSpinStart"`;
  code += `\n  @spin-end="onSpinEnd"`;
  code += `\n/>`;

  return code;
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
};
</script>

<style scoped>
.example {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 0;
  width: 100%;
  height: 100vh;
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
}

.roulette-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: #f5f5f5;
  height: 100%;
  overflow: auto;
}

.header {
  text-align: center;
  max-width: 600px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111927;
  margin: 0 0 0.75rem 0;
}

.header p {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
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

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  background: #27ae60;
  margin-top: 0.5rem;
}

.btn-remove {
  padding: 0.4rem 0.8rem;
  background: #c0392b;
  font-size: 0.9rem;
}

.status {
  text-align: center;
  font-size: 1.1rem;
  min-height: 3rem;
  color: #333;
}

strong {
  color: #f39c12;
}

/* Controls Panel - Dark Mode Sidebar */
.controls {
  background: #1a1d29;
  border-radius: 0;
  padding: 2rem 1.5rem;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  max-height: 100vh;
  overflow-y: auto;
}

.controls::-webkit-scrollbar {
  width: 8px;
}

.controls::-webkit-scrollbar-track {
  background: #0f111a;
}

.controls::-webkit-scrollbar-thumb {
  background: #2d3748;
  border-radius: 4px;
}

.controls::-webkit-scrollbar-thumb:hover {
  background: #4a5568;
}

.controls h2 {
  margin: 0 0 1.5rem 0;
  color: #f5f5f5;
  font-size: 1.5rem;
  font-weight: 700;
}

.control-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #2d3748;
}

.control-group:last-child {
  border-bottom: none;
}

.control-group h3 {
  margin: 0 0 1rem 0;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #a0aec0;
}

label span {
  font-weight: 500;
  color: #cbd5e0;
  font-size: 0.875rem;
}

label.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

label.checkbox input {
  width: auto;
  margin: 0;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #2d3748;
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f39c12;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f39c12;
  cursor: pointer;
  border: none;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f39c12;
}

input[type="text"],
select {
  padding: 0.5rem;
  border: 1px solid #2d3748;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #0f111a;
  color: #e2e8f0;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: #f39c12;
}

select {
  cursor: pointer;
}

input[type="color"] {
  width: 50px;
  height: 35px;
  border: 1px solid #2d3748;
  border-radius: 0.375rem;
  cursor: pointer;
  background: #0f111a;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
}

.input-small {
  padding: 0.5rem;
  border: 1px solid #2d3748;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #0f111a;
  color: #e2e8f0;
}

.input-small:focus {
  outline: none;
  border-color: #f39c12;
}

.input-color {
  width: 50px;
  height: 35px;
  border: 1px solid #2d3748;
  border-radius: 0.375rem;
  cursor: pointer;
  background: #0f111a;
}

/* Code Editor */
.code-editor {
  position: relative;
  background: #0f111a;
  border: 1px solid #2d3748;
  border-radius: 0.5rem;
  overflow: hidden;
}

.btn-copy {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.4rem 0.8rem;
  background: #f39c12;
  color: #1a1d29;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
}

.btn-copy:hover {
  background: #e67e22;
}

.code-editor pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.code-editor pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.code-editor pre::-webkit-scrollbar-track {
  background: #0f111a;
}

.code-editor pre::-webkit-scrollbar-thumb {
  background: #2d3748;
  border-radius: 3px;
}

.code-editor code {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #a0aec0;
  white-space: pre;
}
</style>
