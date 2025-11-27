<template>
  <div class="casino-roulette" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas
      ref="canvasRef"
      class="roulette-canvas"
      :width="size"
      :height="size"
      :aria-label="`Roulette avec ${normalizedItems.length} sections`"
    />
    <div
      v-if="pointerVisible"
      class="roulette-pointer"
      :class="`pointer-${props.pointerPosition}`"
      :style="pointerBaseStyle"
    >
      <div class="pointer-shape" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { RouletteItem } from '../types'

type NormalizedItem = Omit<RouletteItem, 'color'> & { color: string }

type PointerOptions = {
  visible?: boolean
  color?: string
  width?: number
  length?: number
}

const greenColor = '#27ae60'
const redColor = '#c0392b'
const blackColor = '#2c3e50'
const fallbackPalette = ['#f39c12', '#8e44ad', '#16a085', '#d35400']
const centerHoleRatio = 0.28

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
  },
  pointerOptions: {
    type: Object as PropType<PointerOptions>,
    default: () => ({})
  },
  pointerPosition: {
    type: String as PropType<'top' | 'right' | 'bottom' | 'left'>,
    default: 'top'
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
const pointerConfig = computed(() => ({
  visible: true,
  color: '#ffffff',
  width: 26,
  length: 38,
  ...(props.pointerOptions ?? {})
}))
const pointerVisible = computed(() => pointerConfig.value.visible !== false)
const pointerBaseStyle = computed(() => {
  const { width, length, color } = pointerConfig.value
  const base: Record<string, string> = {
    '--pointer-width': `${width}px`,
    '--pointer-length': `${length}px`,
    '--pointer-color': color ?? '#ffffff'
  }
  const offset = `${-(length / 2)}px`
  switch (props.pointerPosition) {
    case 'bottom':
      return { ...base, bottom: offset, left: '50%', transform: 'translate(-50%, 0)' }
    case 'left':
      return { ...base, left: offset, top: '50%', transform: 'translate(0, -50%)' }
    case 'right':
      return { ...base, right: offset, top: '50%', transform: 'translate(0, -50%)' }
    case 'top':
    default:
      return { ...base, top: offset, left: '50%', transform: 'translate(-50%, 0)' }
  }
})

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
  const halfArc = arc / 2
  const adjusted = (normalized - halfArc + 360) % 360
  const offset = (360 - adjusted) % 360
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
  gain.gain.value = 0.15
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
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
  const innerRadius = radius * centerHoleRatio
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
    context.save()
    context.globalCompositeOperation = 'destination-out'
    context.beginPath()
    context.arc(0, 0, innerRadius, 0, Math.PI * 2)
    context.fill()
    context.restore()
    context.beginPath()
    context.arc(0, 0, innerRadius, 0, Math.PI * 2)
    context.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    context.lineWidth = Math.max(2, radius * 0.012)
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

  context.save()
  context.globalCompositeOperation = 'destination-out'
  context.beginPath()
  context.arc(0, 0, innerRadius, 0, Math.PI * 2)
  context.fill()
  context.restore()

  context.beginPath()
  context.arc(0, 0, innerRadius, 0, Math.PI * 2)
  context.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  context.lineWidth = Math.max(2, radius * 0.012)
  context.stroke()

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

const randomSegmentOffset = () => {
  if (normalizedItems.value.length <= 1) {
    return 0.5
  }
  const safeMargin = 0.04
  return safeMargin + Math.random() * (1 - safeMargin * 2)
}

const angleForIndex = (index: number, spins: number, offsetRatio = 0.5) => {
  if (!normalizedItems.value.length) {
    return angle.value
  }
  const arc = segmentDegrees.value
  const currentNormalized = normalizeAngle(angle.value)
  const boundedOffset = Math.min(Math.max(offsetRatio, 0.01), 0.99)
  const halfArc = arc / 2
  const targetNormalized = (360 - (index + boundedOffset) * arc + halfArc) % 360
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
  animationState.value.endAngle = angleForIndex(targetIndex, extraRotations(), randomSegmentOffset())
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
  animationState.value.endAngle = angleForIndex(index, 1, randomSegmentOffset())
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
  background-color: transparent;
}

.roulette-pointer {
  position: absolute;
  width: var(--pointer-width);
  height: var(--pointer-length);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
}

.pointer-shape {
  width: var(--pointer-width);
  height: var(--pointer-length);
  background: var(--pointer-color);
}

.pointer-top .pointer-shape {
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.pointer-bottom .pointer-shape {
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
}

.pointer-left .pointer-shape {
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

.pointer-right .pointer-shape {
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}
</style>
