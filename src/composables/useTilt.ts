import { ref, onMounted, onUnmounted, type Ref, computed } from 'vue'

export function useTilt(target: Ref<HTMLElement | null>, maxRotation = 15) {
  const rotateX = ref(0)
  const rotateY = ref(0)
  const isHovered = ref(false)

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
    rotateX.value = 0
    rotateY.value = 0
    isHovered.value = false
  }

  const handleMouseEnter = () => {
    isHovered.value = true
  }

  const tiltStyle = computed(() => {
    return {
      transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${isHovered.value ? 1.1 : 1})`,
      transition: isHovered.value ? 'none' : 'transform 0.5s ease',
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
