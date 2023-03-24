<script lang="ts" setup>
import { reactive } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  uri: string;
}>()

const state = reactive<{
  mode: boolean;
  x: number;
  y: number;
}>({
  mode: false,
  x: 0.5,
  y: 0.5,
})

function startDrag (event: MouseEvent | TouchEvent) {
  state.mode = true
  const e = (event as TouchEvent).touches != null
    ? (event as TouchEvent).touches[0]
    : event as MouseEvent
  state.x = (e.clientX / window.innerWidth)
  state.y = (e.clientY / window.innerHeight)
  // TODO: やや危険、別の方法を模索すること
  window.document.body.style.overflowX = "hidden"
  window.document.body.style.overflowY = "hidden"
}

function moveDrag (event: MouseEvent | TouchEvent) {
  if (!state.mode || (
    (event as MouseEvent).buttons != null &&
    (event as MouseEvent).buttons !== 1)
  ) return
  const e = (event as TouchEvent).touches != null
    ? (event as TouchEvent).touches[0]
    : event as MouseEvent
  state.x = (e.clientX / window.innerWidth)
  state.y = (e.clientY / window.innerHeight)
}

function endDrag () {
  state.x = 0.5
  state.y = 0.5
  state.mode = false
  // TODO: やや危険、別の方法を模索すること
  window.document.body.style.overflowX = "unset"
  window.document.body.style.overflowY = "scroll"
}

function close () {
  emit("close")
}
</script>

<template>
  <div
    class="image-popup"
    :data-mode="state.mode"
  >
    <div
      class="image"
      :style="`
        background-image: url(${uri ?? '/img/void'});
        background-position: ${state.x * 100}% ${state.y * 100}%
      `"
      @mousedown="startDrag"
      @touchstart.passive="startDrag"
      @mousemove="moveDrag"
      @touchmove.passive="moveDrag"
      @mouseup="endDrag"
      @touchend.passive="endDrag"
    />
    <button
      class="closer"
      @click.prevent="close"
    >
      <SVGIcon name="cross" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.image-popup {
  background-color: rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.image {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  cursor: pointer;
  overscroll-behavior: none;
  width: 100%;
  height: 100%;
  transition: background-position 100ms ease-out;
  [data-mode="false"] & {
    background-size: contain;
  }
}

.closer {
  background-color: rgba(var(--bg-color), 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
  width: 5rem;
  min-height: 5rem;
  [data-mode="true"] & {
    display: none;
  }

  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.75);
    font-size: 2.5rem;
  }

  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }
}
</style>
