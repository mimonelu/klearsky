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
  left?: number
  top?: number
  maxHeight?: number
  directionX: string
  directionY: string
  style: ComputedRef<any>
  animationDirection?: "left" | "right" | "up" | "down"
}>({
  ignore: true,
  left: undefined,
  top: undefined,
  maxHeight: undefined,
  directionX: "",
  directionY: "",
  style: computed((): any => {
    return makeStyle(state.left, state.top)
  }),
  animationDirection: undefined,
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
  animationDirection?: "left" | "right" | "up" | "down",
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

  state.animationDirection = options?.animationDirection

  // フォーカスの設定
  ;(contentElement as HTMLElement).focus()

  await Util.wait(125)
  state.ignore = false
}

function close () {
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
      :data-animation-direction="state.animationDirection"
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
    position: absolute;
    max-width: 300px;

    &[data-animation-direction="left"] {
      margin-left: 1rem;
      transform: translateX(-1rem);
    }
    &[data-animation-direction="right"] {
      margin-left: -1rem;
      transform: translateX(1rem);
    }
    &[data-animation-direction="up"] {
      margin-top: 1rem;
      transform: translateY(-1rem);
    }
    &[data-animation-direction="down"] {
      margin-top: -1rem;
      transform: translateY(1rem);
    }
    transition: transform 125ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  // はみ出し処理用要素
  &__inner {
    @include scroll-bar("transparent");
    background-color: rgb(var(--bg-sub-color));
    border: 1px solid rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    overflow-y: auto;
    overscroll-behavior: none;
  }
}
</style>
