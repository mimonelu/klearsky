<script lang="ts" setup>
import { computed, nextTick, reactive, ref, type ComputedRef } from "vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineExpose({
  open,
  close,
})

const state = reactive<{
  ignore: boolean
  display: boolean
  left?: number
  top?: number
  maxHeight?: number
  directionX: string
  directionY: string
  style: ComputedRef<any>
  hornDirection?: "left" | "right" | "top" | "bottom"
  hornLeft?: number
  hornTop?: number
  hornStyle: ComputedRef<any>
}>({
  ignore: true,
  display: false,
  left: undefined,
  top: undefined,
  maxHeight: undefined,
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

const popover = ref(null)

const popoverContent = ref(null)

const popoverInner = ref(null)

async function open (selector: string | HTMLElement, options?: {
  positionX?: "left" | "center" | "right",
  positionY?: "top" | "middle" | "bottom",
  directionX?: "left" | "center" | "right",
  directionY?: "up" | "middle" | "down",
  collideX?: boolean,
  collideY?: boolean,
  hornDirection?: "left" | "right" | "top" | "bottom",
  isChild?: boolean,
}) {
  state.ignore = true
  state.directionX = options?.directionX ?? "right"
  state.directionY = options?.directionY ?? "down"
  await nextTick()

  // DOM要素の取得
  const popoverElement = popover.value as null | HTMLElement
  if (popoverElement == null) {
    return
  }
  const targetElement = typeof selector === "string"
    ? document.querySelector(selector)
    : selector
  if (targetElement == null) {
    return
  }
  const contentElement = popoverContent.value as null | HTMLElement
  if (contentElement == null) {
    return
  }

  // 初期化
  state.display = true
  state.top = undefined
  state.left = undefined
  state.maxHeight = undefined

  // 位置 `position` の処理
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

  // 子ポップオーバーの処理
  if (options?.isChild) {
    const popoverRect = popoverElement.getBoundingClientRect()
    popoverElement.style.left = `-${popoverRect.left}px`
    popoverElement.style.top = `-${popoverRect.top}px`
    popoverElement.style.width = "unset"
    popoverElement.style.height = "unset"
  }

  // 方向 `direction` の処理
  const contentRect = contentElement.getBoundingClientRect()
  if (state.directionX === "left") {
    state.left -= contentRect.width
  } else if (state.directionX === "center") {
    state.left -= contentRect.width / 2
  }
  if (state.directionY === "up") {
    state.top -= contentRect.height
  } else if (state.directionY === "middle") {
    state.top -= contentRect.height / 2
  }

  // 衝突 `collide` 処理
  if (options?.collideX) {
    const diffX = (state.left + contentRect.width) - window.innerWidth
    if (diffX > 0) {
      state.left -= diffX
    }
    if (state.left < 0) {
      state.left = 0
    }
  }
  if (options?.collideY) {
    const diffY = (state.top + contentRect.height) - window.innerHeight
    if (diffY > 0) {
      state.top -= diffY
    }
    if (state.top < 0) {
      state.top = 0
    }
  }

  // はみ出し処理
  const innerElement = popoverInner.value as null | HTMLElement
  if (innerElement != null) {
    const innerRect = innerElement.getBoundingClientRect()
    const clippingDiffY = (state.top + contentRect.height) - window.innerHeight
    state.maxHeight = innerRect.height - clippingDiffY
  }

  // ツノ `horn` の処理
  if (options?.hornDirection != null) {
    state.hornLeft = undefined
    state.hornTop = undefined
    state.hornDirection = options.hornDirection
    switch (options.hornDirection) {
      case "left": {
        state.hornLeft = 1
        state.hornTop = targetRect.top + (targetRect.height / 2) - state.top
        break
      }
      case "right": {
        state.hornLeft = contentRect.width - 1
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
        state.hornTop = contentRect.height - 1
        break
      }
    }
  }

  // フォーカスの設定
  (contentElement as HTMLElement).focus()

  await Util.wait(125)
  state.ignore = false
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
    ref="popover"
    :data-ignore="state.ignore"
    @click.self="close"
  >
    <!-- 本体要素 -->
    <div
      class="popover__content"
      ref="popoverContent"
      :style="state.style"
      :data-display="state.display"
      :data-direction-x="state.directionX"
      :data-direction-y="state.directionY"
      tabindex="0"
    >
      <!-- はみ出し処理用要素 -->
      <div
        class="popover__inner"
        ref="popoverInner"
        :style="{ maxHeight: `${state.maxHeight}px` }"
      >
        <slot />
      </div>

      <!-- ツノ -->
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
  z-index: 3;
  width: 100vw;
  height: 100vh;
  &[data-ignore="true"] {
    pointer-events: none;
  }

  // 本体要素
  &__content {
    --offset-x: 0;
    --offset-y: 0;
    filter: drop-shadow(0 0 1rem rgb(0, 0, 0, 0.375));
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

  // はみ出し処理用要素
  &__inner {
    @include scroll-bar("transparent");
    overflow-y: auto;
    overscroll-behavior: none;
  }

  // ツノ
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
