import { ref, type Ref, computed, onMounted, onUnmounted } from 'vue'

export function useTilt(target: Ref<HTMLElement | null>, maxRotation = 15) {
  const rotateX = ref(0)
  const rotateY = ref(0)
  const isHovered = ref(false)
  
  // Random offset so things don't rotate in sync
  const randomOffset = Math.random() * Math.PI * 2
  let frameId: number | null = null

  const animate = () => {
    if (!isHovered.value) {
      // Subtly circle around when not hovered
      const time = performance.now() * 0.001 // Convert to seconds
      const speed = 1.2
      const phase = time * speed + randomOffset
      
      // Use a smaller amplitude for the idle animation
      const idleMax = maxRotation * 1.1
      rotateX.value = Math.sin(phase) * idleMax
      rotateY.value = Math.cos(phase) * idleMax
    }
    frameId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    frameId = requestAnimationFrame(animate)
  })

  onUnmounted(() => {
    if (frameId) {
      cancelAnimationFrame(frameId)
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

    rotateX.value = rotateXVal
    rotateY.value = rotateYVal
    isHovered.value = true
  }

  const handleMouseLeave = () => {
    isHovered.value = false
  }

  const handleMouseEnter = () => {
    isHovered.value = true
  }

  const tiltStyle = computed(() => {
    return {
      transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${isHovered.value ? 1.05 : 1})`,
      // Transition only when not hovered to smooth the return to circling path
      // When hovered, we want instant response
      transition: isHovered.value ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
      transformStyle: 'preserve-3d' as const,
      willChange: 'transform'
    }
  })

  return {
    tiltStyle,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave
  }
}
