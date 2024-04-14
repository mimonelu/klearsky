<script lang="ts" setup>
import { computed, nextTick, reactive, ref, type ComputedRef } from "vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineExpose({
  open,
  close,
})

const state = reactive<{
  display: boolean
  left?: number
  top?: number
  directionX: string
  directionY: string
  style: ComputedRef<any>
}>({
  display: false,
  top: undefined,
  left: undefined,
  directionX: "",
  directionY: "",
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

async function open (selector: string, options?: {
  positionX?: "left" | "center" | "right",
  positionY?: "top" | "middle" | "bottom",
  directionX?: "left" | "center" | "right",
  directionY?: "up" | "middle" | "down"
}) {
  state.directionX = options?.directionX ?? "right"
  state.directionY = options?.directionY ?? "down"
  await nextTick()

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
  if (state.directionX === "left") {
    state.left -= selfRect.width
  } else if (state.directionX === "center") {
    state.left -= selfRect.width / 2
  }
  if (state.directionY === "up") {
    state.top -= selfRect.height
  } else if (state.directionY === "middle") {
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
      :data-direction-x="state.directionX"
      :data-direction-y="state.directionY"
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
    --offset-x: 0;
    --offset-y: 0;
    position: absolute;
    transform: translate(var(--offset-x), var(--offset-y));
    transition: transform 125ms cubic-bezier(0.34, 1.56, 0.64, 1);
    &[data-direction-x="left"] {
      --offset-x: 1.0rem;
    }
    &[data-direction-x="right"] {
      --offset-x: -1.0rem;
    }
    &[data-direction-y="up"] {
      --offset-y: 1.0rem;
    }
    &[data-direction-y="down"] {
      --offset-y: -1.0rem;
    }
    &[data-display="true"] {
      transform: translate(0, 0);
    }
  }
}
</style>
