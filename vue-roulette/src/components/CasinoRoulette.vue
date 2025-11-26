<template>
  <div class="casino-roulette" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas
      ref="canvasRef"
      class="roulette-canvas"
      :width="size"
      :height="size"
      :aria-label="`Roulette avec ${normalizedItems.length} sections`"
    />
    <div class="roulette-pointer">
      <span />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { RouletteItem } from '../types'

type NormalizedItem = Omit<RouletteItem, 'color'> & { color: string }

const greenColor = '#27ae60'
const redColor = '#c0392b'
const blackColor = '#2c3e50'
const fallbackPalette = ['#f39c12', '#8e44ad', '#16a085', '#d35400']

const props = defineProps({
  items: {
    type: Array as PropType<RouletteItem[]>,
    required: true
  },
  size: {
    type: Number,
    default: 400
  },
  spinDuration: {
    type: Number,
    default: 4000
  },
  easingFunction: {
    type: Function as PropType<(t: number) => number>,
    default: (t: number) => 1 - Math.pow(1 - t, 4)
  },
  useColor: {
    type: Boolean,
    default: false
  },
  initialVelocity: {
    type: Number,
    default: 2000
  },
  initialAngle: {
    type: Number,
    default: 0
  },
  enableTickSound: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'spin-start'): void
  (e: 'spin-end'): void
  (e: 'select', item: RouletteItem): void
  (e: 'update:angle', angle: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const angle = ref(props.initialAngle)
const spinning = ref(false)
const animationFrame = ref<number | null>(null)
const animationState = ref({
  startAngle: props.initialAngle,
  endAngle: props.initialAngle,
  duration: props.spinDuration,
  startTime: 0
})
const targetItem = ref<RouletteItem | null>(null)
const lastIndex = ref<number | null>(null)
const audioContext = ref<AudioContext | null>(null)
const pendingStop = ref(false)

const normalizedItems = computed<NormalizedItem[]>(() => {
  const includeGreen = !props.useColor && props.items.length % 2 === 1
  const baseItems: RouletteItem[] = includeGreen
    ? [{ label: '0', value: '0', color: greenColor }, ...props.items]
    : [...props.items]

  return baseItems.map((item, index) => {
    if (props.useColor) {
      const paletteIndex = fallbackPalette.length ? index % fallbackPalette.length : 0
      const fallbackColor = fallbackPalette[paletteIndex] ?? '#ffffff'
      const color: string = item.color ?? fallbackColor
      return { label: item.label, value: item.value, color } as NormalizedItem
    }
    if (includeGreen && index === 0) {
      return { label: item.label, value: item.value, color: greenColor } as NormalizedItem
    }
    const offset = includeGreen ? index - 1 : index
    const color: string = offset % 2 === 0 ? redColor : blackColor
    return { label: item.label, value: item.value, color } as NormalizedItem
  })
})

const segmentDegrees = computed(() => {
  if (!normalizedItems.value.length) {
    return 0
  }
  return 360 / normalizedItems.value.length
})

const normalizeAngle = (value: number) => {
  const normalized = value % 360
  return normalized >= 0 ? normalized : normalized + 360
}

const getIndexFromAngle = (value: number) => {
  if (!normalizedItems.value.length) {
    return null
  }
  const normalized = normalizeAngle(value)
  const arc = segmentDegrees.value
  const offset = (360 - normalized) % 360
  let index = Math.floor(offset / arc)
  if (index >= normalizedItems.value.length) {
    index = normalizedItems.value.length - 1
  }
  return index
}

const getCurrentItem = (): RouletteItem | null => {
  const index = getIndexFromAngle(angle.value)
  if (index === null) {
    return null
  }
  return normalizedItems.value[index] ?? null
}

const playTick = () => {
  if (!props.enableTickSound) {
    return
  }
  if (typeof window === 'undefined') {
    return
  }
  if (!audioContext.value) {
    audioContext.value = new AudioContext()
  }
  const ctx = audioContext.value
  if (!ctx) {
    return
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.frequency.value = 1200
  gain.gain.value = 0.0015
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.0015, now)
  gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.02)
  oscillator.start(now)
  oscillator.stop(now + 0.02)
}

const updateTickState = () => {
  const index = getIndexFromAngle(angle.value)
  if (index === null) {
    return
  }
  if (lastIndex.value === index) {
    return
  }
  lastIndex.value = index
  playTick()
}

const emitAngleUpdate = () => {
  emit('update:angle', normalizeAngle(angle.value))
}

const drawWheel = () => {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }
  const dimension = props.size
  const radius = dimension / 2
  context.clearRect(0, 0, dimension, dimension)
  context.save()
  context.translate(radius, radius)

  const count = normalizedItems.value.length
  if (!count) {
    context.beginPath()
    context.arc(0, 0, radius - 8, 0, Math.PI * 2)
    context.strokeStyle = '#d6d6d6'
    context.lineWidth = 4
    context.stroke()
    context.restore()
    return
  }

  const arc = (2 * Math.PI) / count
  const rotation = (angle.value * Math.PI) / 180
  const baseOffset = -Math.PI / 2 - arc / 2

  normalizedItems.value.forEach((item, index) => {
    const start = rotation + index * arc + baseOffset
    const end = start + arc
    context.beginPath()
    context.moveTo(0, 0)
    context.fillStyle = item.color
    context.arc(0, 0, radius - 4, start, end)
    context.closePath()
    context.fill()

    context.save()
    context.fillStyle = '#ffffff'
    context.rotate((start + end) / 2)
    context.textAlign = 'right'
    context.font = `${Math.max(14, radius * 0.08)}px sans-serif`
    context.fillText(item.label, radius - 24, 6)
    context.restore()
  })

  context.beginPath()
  context.arc(0, 0, radius * 0.6, 0, Math.PI * 2)
  context.fillStyle = '#ffffff'
  context.fill()

  context.beginPath()
  context.arc(0, 0, radius * 0.12, 0, Math.PI * 2)
  context.fillStyle = '#202020'
  context.fill()

  context.restore()
}

const cancelAnimation = () => {
  if (animationFrame.value !== null) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
}

const requestAnimation = () => {
  cancelAnimation()
  animationFrame.value = requestAnimationFrame(step)
}

const step = (timestamp: number) => {
  if (!animationState.value.startTime) {
    animationState.value.startTime = timestamp
  }
  const elapsed = timestamp - animationState.value.startTime
  const duration = animationState.value.duration || 1
  const t = Math.min(elapsed / duration, 1)
  const eased = props.easingFunction(t)
  angle.value = animationState.value.startAngle + (animationState.value.endAngle - animationState.value.startAngle) * eased
  emitAngleUpdate()
  updateTickState()
  drawWheel()

  if (t < 1) {
    animationFrame.value = requestAnimationFrame(step)
  } else {
    finalizeSpin()
  }
}

const finalizeSpin = () => {
  cancelAnimation()
  spinning.value = false
  pendingStop.value = false
  emitAngleUpdate()
  drawWheel()
  emit('spin-end')
  const current = getCurrentItem()
  targetItem.value = current
  if (current) {
    emit('select', current)
  }
}

const extraRotations = () => {
  const base = Math.floor((props.initialVelocity * props.spinDuration) / (360 * 1000))
  const minimum = Math.max(3, base)
  return minimum + Math.floor(Math.random() * 3)
}

const angleForIndex = (index: number, spins: number) => {
  if (!normalizedItems.value.length) {
    return angle.value
  }
  const arc = segmentDegrees.value
  const currentNormalized = normalizeAngle(angle.value)
  const targetNormalized = (360 - (index + 0.5) * arc) % 360
  let delta = targetNormalized - currentNormalized
  if (delta <= 0) {
    delta += 360
  }
  delta += spins * 360
  return angle.value + delta
}

const spin = () => {
  if (!normalizedItems.value.length || spinning.value) {
    return
  }
  pendingStop.value = false
  const targetIndex = Math.floor(Math.random() * normalizedItems.value.length)
  const candidate = normalizedItems.value[targetIndex]
  if (!candidate) {
    return
  }
  targetItem.value = candidate
  animationState.value.startAngle = angle.value
  animationState.value.endAngle = angleForIndex(targetIndex, extraRotations())
  animationState.value.duration = props.spinDuration
  animationState.value.startTime = 0
  spinning.value = true
  emit('spin-start')
  requestAnimation()
}

const stop = () => {
  if (!spinning.value || pendingStop.value) {
    return
  }
  pendingStop.value = true
  const index = getIndexFromAngle(angle.value)
  if (index === null) {
    return
  }
  const candidate = normalizedItems.value[index]
  if (!candidate) {
    return
  }
  targetItem.value = candidate
  animationState.value.startAngle = angle.value
  animationState.value.endAngle = angleForIndex(index, 1)
  animationState.value.duration = Math.min(props.spinDuration / 2, 1000)
  animationState.value.startTime = 0
}

const reset = () => {
  cancelAnimation()
  spinning.value = false
  pendingStop.value = false
  targetItem.value = null
  angle.value = props.initialAngle
  animationState.value = {
    startAngle: props.initialAngle,
    endAngle: props.initialAngle,
    duration: props.spinDuration,
    startTime: 0
  }
  emitAngleUpdate()
  drawWheel()
  lastIndex.value = getIndexFromAngle(angle.value)
}

watch(
  () => props.size,
  () => {
    nextTick(drawWheel)
  }
)

watch(
  () => props.initialAngle,
  value => {
    if (spinning.value) {
      return
    }
    angle.value = value
    animationState.value.startAngle = value
    animationState.value.endAngle = value
    animationState.value.startTime = 0
    drawWheel()
  }
)

watch(
  () => props.spinDuration,
  value => {
    animationState.value.duration = value
  }
)

watch(normalizedItems, () => {
  nextTick(() => {
    lastIndex.value = getIndexFromAngle(angle.value)
    drawWheel()
  })
})

onMounted(() => {
  drawWheel()
  lastIndex.value = getIndexFromAngle(angle.value)
})

onBeforeUnmount(() => {
  cancelAnimation()
  if (audioContext.value) {
    audioContext.value.close()
  }
})

defineExpose({
  spin,
  stop,
  reset,
  getCurrentItem
})
</script>

<style scoped>
.casino-roulette {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.roulette-canvas {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  background-color: #0f0f0f;
}

.roulette-pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-bottom: 24px solid #f5f5f5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.roulette-pointer span {
  position: absolute;
  top: 18px;
  left: -1px;
  width: 2px;
  height: 18px;
  background: #333333;
}
</style>
