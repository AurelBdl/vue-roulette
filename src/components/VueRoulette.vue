<template>
  <div class="casino-roulette" :style="{ width: size + 'px', height: size + 'px' }">
    <canvas
      ref="canvasRef"
      class="roulette-canvas"
      :class="{ 'clickable': spinOnClick }"
      :width="size"
      :height="size"
      :aria-label="`Roulette avec ${normalizedItems.length} sections`"
      @click="handleCanvasClick"
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
import './VueRoulette.css'

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
  },
  centerHoleRatio: {
    type: Number,
    default: 0.28
  },
  spinOnClick: {
    type: Boolean,
    default: false
  },
  tickSoundVolume: {
    type: Number,
    default: 0.15
  },
  borderWidth: {
    type: Number,
    default: 4
  },
  borderColor: {
    type: String,
    default: '#ffffff'
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
  const shouldGreenFirst = !props.useColor && props.items.length % 2 === 1

  return props.items.map((item, index) => {
    if (props.useColor) {
      const paletteIndex = fallbackPalette.length ? index % fallbackPalette.length : 0
      const fallbackColor = fallbackPalette[paletteIndex] ?? '#ffffff'
      const color: string = item.color ?? fallbackColor
      return { label: item.label, value: item.value, color } as NormalizedItem
    }
    // Si nombre impair et pas useColor, le premier élément est vert
    if (shouldGreenFirst && index === 0) {
      return { label: item.label, value: item.value, color: greenColor } as NormalizedItem
    }
    // Pour les autres éléments, alterner rouge/noir
    // Si premier est vert, on commence à 0 pour avoir rouge en index 1
    const offset = shouldGreenFirst ? index - 1 : index
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

const getPointerAngleOffset = () => {
  switch (props.pointerPosition) {
    case 'right':
      return -90
    case 'bottom':
      return 180
    case 'left':
      return 90
    case 'top':
    default:
      return 0
  }
}

const getIndexFromAngle = (value: number) => {
  if (!normalizedItems.value.length) {
    return null
  }
  // Adjust angle based on pointer position
  const pointerOffset = getPointerAngleOffset()
  const adjustedValue = value + pointerOffset
  const normalized = normalizeAngle(adjustedValue)
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
  const volume = Math.max(0, Math.min(1, props.tickSoundVolume))
  oscillator.frequency.value = 1200
  gain.gain.value = volume
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  const now = ctx.currentTime
  gain.gain.setValueAtTime(volume, now)
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

const getTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  let color = backgroundColor.replace('#', '')
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('')
  }
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#ffffff'
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
  const innerRadius = radius * props.centerHoleRatio
  context.clearRect(0, 0, dimension, dimension)
  context.save()
  context.translate(radius, radius)

  const count = normalizedItems.value.length
  const borderWidth = props.borderWidth ?? 4
  
  if (!count) {
    const effectiveRadius = radius - borderWidth / 2
    context.beginPath()
    context.arc(0, 0, effectiveRadius, 0, Math.PI * 2)
    context.strokeStyle = props.borderColor
    context.lineWidth = borderWidth
    context.stroke()
    context.save()
    context.globalCompositeOperation = 'destination-out'
    context.beginPath()
    context.arc(0, 0, innerRadius, 0, Math.PI * 2)
    context.fill()
    context.restore()
    context.beginPath()
    context.arc(0, 0, innerRadius, 0, Math.PI * 2)
    context.strokeStyle = props.borderColor
    context.lineWidth = borderWidth
    context.stroke()
    context.restore()
    return
  }

  const arc = (2 * Math.PI) / count
  const rotation = (angle.value * Math.PI) / 180
  const baseOffset = -Math.PI / 2 - arc / 2
  const effectiveRadius = radius - borderWidth / 2

  normalizedItems.value.forEach((item, index) => {
    const start = rotation + index * arc + baseOffset
    const end = start + arc
    context.beginPath()
    context.moveTo(0, 0)
    context.fillStyle = item.color
    context.arc(0, 0, effectiveRadius, start, end)
    context.closePath()
    context.fill()

    context.save()
    context.fillStyle = getTextColor(item.color)
    context.rotate((start + end) / 2)
    context.textAlign = 'right'
    context.font = `${Math.max(14, radius * 0.08)}px sans-serif`
    context.fillText(item.label, effectiveRadius - 20, 6)
    context.restore()
  })

  // Draw outer border
  if (borderWidth > 0) {
    context.beginPath()
    context.arc(0, 0, effectiveRadius, 0, Math.PI * 2)
    context.strokeStyle = props.borderColor
    context.lineWidth = borderWidth
    context.stroke()
  }

  context.save()
  context.globalCompositeOperation = 'destination-out'
  context.beginPath()
  context.arc(0, 0, innerRadius, 0, Math.PI * 2)
  context.fill()
  context.restore()

  // Draw inner border
  if (borderWidth > 0) {
    context.beginPath()
    context.arc(0, 0, innerRadius, 0, Math.PI * 2)
    context.strokeStyle = props.borderColor
    context.lineWidth = borderWidth
    context.stroke()
  }

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

const handleCanvasClick = () => {
  if (props.spinOnClick) {
    spin()
  }
}

watch(
  () => props.size,
  () => {
    nextTick(drawWheel)
  }
)

watch(
  () => props.centerHoleRatio,
  () => {
    nextTick(drawWheel)
  }
)

watch(
  () => props.borderWidth,
  () => {
    nextTick(drawWheel)
  }
)

watch(
  () => props.borderColor,
  () => {
    nextTick(drawWheel)
  }
)

watch(
  () => props.pointerPosition,
  () => {
    lastIndex.value = getIndexFromAngle(angle.value)
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

