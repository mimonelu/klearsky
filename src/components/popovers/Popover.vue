<script lang="ts" setup>
import { computed, reactive, ref, type ComputedRef } from "vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineExpose({
  open,
  close,
})

const state = reactive<{
  display: boolean
  left?: number
  top?: number
  style: ComputedRef<any>
}>({
  display: false,
  top: undefined,
  left: undefined,
  style: computed((): any => {
    const result: any = {}
    if (state.left != null) {
      result.left = `${state.left}px`
    }
    if (state.top != null) {
      result.top = `${state.top}px`
    }
    return result
  }),
})

const popoverContent = ref(null)

function open (selector: string, options?: {
  positionX?: "left" | "center" | "right",
  positionY?: "top" | "middle" | "bottom",
  directionX?: "left" | "center" | "right",
  directionY?: "up" | "middle" | "down"
}) {
  const targetElement = document.querySelector(selector)
  if (targetElement == null) {
    return
  }
  const selfElement = popoverContent.value as null | HTMLElement
  if (selfElement == null) {
    return
  }

  state.display = true
  state.top = undefined
  state.left = undefined

  const targetRect = targetElement.getBoundingClientRect()
  const positionX = options?.positionX ?? "left"
  const positionY = options?.positionY ?? "top"
  state.left = positionX === "left"
    ? targetRect.left
    : positionX === "right"
      ? targetRect.right
      : (targetRect.left + targetRect.right) / 2
  state.top = positionY === "top"
    ? targetRect.top
    : positionY === "bottom"
      ? targetRect.bottom
      : (targetRect.top + targetRect.bottom) / 2

  const selfRect = selfElement.getBoundingClientRect()
  const directionX = options?.directionX ?? "right"
  const directionY = options?.directionY ?? "down"
  if (directionX === "left") {
    state.left -= selfRect.width
  } else if (directionX === "center") {
    state.left -= selfRect.width / 2
  }
  if (directionY === "up") {
    state.top -= selfRect.height
  } else if (directionY === "middle") {
    state.top -= selfRect.height / 2
  }

  // selfElement.focus()
}

function close () {
  state.display = false
  emit("close")
}
</script>

<template>
  <div
    class="popover"
    @click.self="close"
  >
    <div
      class="popover__content"
      ref="popoverContent"
      :style="state.style"
      :data-display="state.display"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.popover {
  overscroll-behavior: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2;
  width: 100vw;
  height: 100vh;

  &__content {
    position: absolute;
    // transform: scale(0.875);
    // transition: transform 125ms cubic-bezier(0.34, 1.56, 0.64, 1);
    &[data-display="true"] {
      // transform: scale(1.0);
    }
  }
}
</style>
