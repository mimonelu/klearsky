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
  hornDirection?: "left" | "right" | "top" | "bottom"
  hornLeft?: number
  hornTop?: number
  hornStyle: ComputedRef<any>
}>({
  display: false,
  left: undefined,
  top: undefined,
  directionX: "",
  directionY: "",
  style: computed((): any => {
    return makeStyle(state.left, state.top)
  }),
  hornDirection: undefined,
  hornLeft: undefined,
  hornTop: undefined,
  hornStyle: computed((): any => {
    return makeStyle(state.hornLeft, state.hornTop)
  }),
})

const popoverContent = ref(null)

async function open (selector: string, options?: {
  positionX?: "left" | "center" | "right",
  positionY?: "top" | "middle" | "bottom",
  directionX?: "left" | "center" | "right",
  directionY?: "up" | "middle" | "down",
  collideX?: boolean,
  collideY?: boolean,
  hornDirection?: "left" | "right" | "top" | "bottom",
}) {
  state.directionX = options?.directionX ?? "right"
  state.directionY = options?.directionY ?? "down"
  await nextTick()

  const targetElement = document.querySelector(selector)
  if (targetElement == null) {
    return
  }
  const contentElement = popoverContent.value as null | HTMLElement
  if (contentElement == null) {
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

  const contentfRect = contentElement.getBoundingClientRect()
  if (state.directionX === "left") {
    state.left -= contentfRect.width
  } else if (state.directionX === "center") {
    state.left -= contentfRect.width / 2
  }
  if (state.directionY === "up") {
    state.top -= contentfRect.height
  } else if (state.directionY === "middle") {
    state.top -= contentfRect.height / 2
  }

  if (options?.collideX) {
    const diffX = (state.left + contentfRect.width) - window.innerWidth
    if (diffX > 0) {
      state.left -= diffX
    }
    if (state.left < 0) {
      state.left = 0
    }
  }
  if (options?.collideY) {
    const diffY = (state.top + contentfRect.height) - window.innerHeight
    if (diffY > 0) {
      state.top -= diffY
    }
    if (state.top < 0) {
      state.top = 0
    }
  }

  if (options?.hornDirection != null) {
    state.hornDirection = options.hornDirection
    switch (options.hornDirection) {
      case "left": {
        state.hornLeft = 1
        state.hornTop = targetRect.top + (targetRect.height / 2) - state.top
        break
      }
      case "right": {
        state.hornLeft = contentfRect.width - 1
        state.hornTop = targetRect.top + (targetRect.height / 2) - state.top
        break
      }
      case "top": {
        state.hornLeft = targetRect.left + (targetRect.width / 2) - state.left
        state.hornTop = 1
        break
      }
      case "bottom": {
        state.hornLeft = targetRect.left + (targetRect.width / 2) - state.left
        state.hornTop = contentfRect.height - 1
        break
      }
    }
  }

  (contentElement as HTMLElement).focus()
}

function close () {
  state.display = false
  emit("close")
}

function makeStyle (left?: number, top?: number) {
  const result: any = {}
  if (left != null) {
    result.left = `${left}px`
  }
  if (top != null) {
    result.top = `${top}px`
  }
  return result
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
      tabindex="0"
    >
      <slot />
      <div
        class="popover__horn"
        :data-horn-direction="state.hornDirection"
        :style="state.hornStyle"
      />
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
    filter: drop-shadow(0 0 1rem rgb(0, 0, 0, 0.5));
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

  &__horn {
    pointer-events: none;
    position: fixed;
    &[data-horn-direction="left"] {
      @include triangle(left, 1rem, 1rem, rgb(var(--fg-color)));
    }
    &[data-horn-direction="right"] {
      @include triangle(right, 1rem, 1rem, rgb(var(--fg-color)));
    }
    &[data-horn-direction="top"] {
      @include triangle(top, 1rem, 1rem, rgb(var(--fg-color)));
    }
    &[data-horn-direction="bottom"] {
      @include triangle(bottom, 1rem, 1rem, rgb(var(--fg-color)));
    }
  }
}
</style>
