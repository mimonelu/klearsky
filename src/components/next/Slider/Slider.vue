<script lang="ts" setup>
// 横スワイプ特化のスライダーコンポーネント
// PCでのみ動作し、SPではブラウザに委任している

import { onBeforeUnmount, onMounted, ref, type Ref } from "vue"

const DRAG_THRESHOLD = 4
const DRAG_MULTIPLIER = 1.75
const slider: Ref<null | HTMLElement> = ref(null)

let moving = false
let moved = false
let startClientX = 0
let startScrollLeft = 0

onMounted(() => {
  window.addEventListener("pointermove", onPointerMove, false)
  window.addEventListener("pointerup", onPointerUp, false)
  window.addEventListener("click", onClick, true)
  if (slider.value == null) {
    return
  }
  slider.value.addEventListener("pointerdown", onPointerDown, false)
  slider.value.addEventListener("pointercancel", onPointerUp, false)
})

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove, false)
  window.removeEventListener("pointerup", onPointerUp, false)
  window.removeEventListener("click", onClick, true)
  if (slider.value == null) {
    return
  }
  slider.value.removeEventListener("pointerdown", onPointerDown, false)
  slider.value.removeEventListener("pointercancel", onPointerUp, false)
})

function onPointerDown (event: PointerEvent) {
  if (event.pointerType !== "mouse") {
    return
  }
  if (slider.value == null) {
    return
  }
  event.preventDefault()
  moving = true
  moved = false
  startClientX = event.clientX
  startScrollLeft = slider.value.scrollLeft
}

function onPointerMove (event: PointerEvent) {
  if (event.pointerType !== "mouse") {
    return
  }
  if (slider.value == null) {
    return
  }
  if (!moving) {
    return
  }
  const diff = event.clientX - startClientX
  if (Math.abs(diff) > DRAG_THRESHOLD) {
    moved = true
  }
  slider.value.scrollLeft = startScrollLeft - diff * DRAG_MULTIPLIER
}

function onPointerUp (event: PointerEvent) {
  if (event.pointerType !== "mouse") {
    return
  }
  if (slider.value == null) {
    return
  }
  if (!moving) {
    return
  }
  moving = false
}

function onClick (event: MouseEvent) {
  if (!moved) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  moved = false
}
</script>

<template>
  <div
    class="slider"
    ref="slider"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.slider {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;

  /* アイテム単位でスクロールしたい際はコメントアウト
  & > * {
    scroll-snap-align: start;
  }
  */
}
</style>
