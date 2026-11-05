import { ref, type Ref, computed, onMounted, onUnmounted } from 'vue'

type TiltSubscriber = (timeSec: number) => void
const subscribers = new Set<TiltSubscriber>()
let sharedFrameId: number | null = null
let lastSharedTick = 0
const FRAME_INTERVAL = 1000 / 30 // ~30 FPS for subtle idle tilt

function runSharedLoop(now: number) {
  if (subscribers.size === 0) {
    sharedFrameId = null
    return
  }

  sharedFrameId = requestAnimationFrame(runSharedLoop)

  if (document.hidden || now - lastSharedTick < FRAME_INTERVAL) {
    return
  }
  lastSharedTick = now
  const timeSec = (now * 0.001) % 3600

  for (const sub of subscribers) {
    sub(timeSec)
  }
}

function subscribeTilt(sub: TiltSubscriber) {
  subscribers.add(sub)
  if (sharedFrameId === null) {
    sharedFrameId = requestAnimationFrame(runSharedLoop)
  }
}

function unsubscribeTilt(sub: TiltSubscriber) {
  subscribers.delete(sub)
  if (subscribers.size === 0 && sharedFrameId !== null) {
    cancelAnimationFrame(sharedFrameId)
    sharedFrameId = null
  }
}

export function useTilt(target: Ref<HTMLElement | null>, maxRotation = 15) {
  const rotateX = ref(0)
  const rotateY = ref(0)
  const isHovered = ref(false)
  const isReturning = ref(false)
  let returnTimeoutId: ReturnType<typeof setTimeout> | null = null

  // Random offset so things don't rotate in sync
  const randomOffset = Math.random() * Math.PI * 2
  const idleMax = maxRotation * 1.1

  const updateIdle = (timeSec: number) => {
    if (isHovered.value) return
    const el = target.value
    // Skip updating hidden or detached elements (e.g. inside inactive .stage-panel)
    if (!el || !el.isConnected || el.closest('.stage-panel:not(.active)')) return

    const phase = timeSec * 1.2 + randomOffset
    rotateX.value = Math.round(Math.sin(phase) * idleMax * 100) / 100
    rotateY.value = Math.round(Math.cos(phase) * idleMax * 100) / 100
  }

  onMounted(() => {
    subscribeTilt(updateIdle)
  })

  onUnmounted(() => {
    unsubscribeTilt(updateIdle)
    if (returnTimeoutId) {
      clearTimeout(returnTimeoutId)
      returnTimeoutId = null
    }
  })

  const handleMouseMove = (e: MouseEvent) => {
    if (!target.value) return

    const { left, top, width, height } = target.value.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const centerX = width / 2
    const centerY = height / 2

    // Calculate rotation (-1 to 1)
    const rotateYVal = ((x - centerX) / centerX) * maxRotation
    const rotateXVal = ((centerY - y) / centerY) * maxRotation

    rotateX.value = Math.round(rotateXVal * 100) / 100
    rotateY.value = Math.round(rotateYVal * 100) / 100
    isHovered.value = true
    isReturning.value = false
  }

  const handleMouseLeave = () => {
    isHovered.value = false
    isReturning.value = true
    if (returnTimeoutId) clearTimeout(returnTimeoutId)
    returnTimeoutId = setTimeout(() => {
      isReturning.value = false
      returnTimeoutId = null
    }, 600)
  }

  const handleMouseEnter = () => {
    if (returnTimeoutId) {
      clearTimeout(returnTimeoutId)
      returnTimeoutId = null
    }
    isReturning.value = false
    isHovered.value = true
  }

  const tiltStyle = computed(() => {
    return {
      transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${isHovered.value ? 1.05 : 1})`,
      // Transition only while returning from hover to the circling path, avoiding starting a new transition on every idle frame
      transition: isReturning.value ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
      transformStyle: 'preserve-3d' as const,
      willChange: isHovered.value || isReturning.value ? 'transform' : 'auto'
    }
  })

  return {
    tiltStyle,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  }
}
