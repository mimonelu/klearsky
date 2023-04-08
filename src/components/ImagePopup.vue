<script lang="ts" setup>
import { inject, reactive } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  largeUri: string;
  smallUri: string;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  isBlob: boolean;
  loaded: boolean;
  mode: boolean;
  x: number;
  y: number;
}>({
  isBlob: props.largeUri.startsWith("blob:"),
  loaded: false,
  mode: false,
  x: 0.5,
  y: 0.5,
})

function startDrag (event: MouseEvent | TouchEvent) {
  const e = (event as TouchEvent).touches != null
    ? (event as TouchEvent).touches[0]
    : event as MouseEvent

  // 右クリックはスルー
  if ((e as MouseEvent).button != null && (e as MouseEvent).button !== 0) return

  state.mode = true
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
  window.document.body.style.overflowX = "hidden"
  window.document.body.style.overflowY = "scroll"
}

function onLoadLargeImage () {
  state.loaded = true
}

function setBackgroundImage () {
  blurElement()
  if (!state.loaded) return
  if (mainState.currentSetting == null) return
  mainState.currentSetting.backgroundImage = props.largeUri
  mainState.saveSettings()
}

function close () {
  blurElement()
  emit("close")
}
</script>

<template>
  <div
    class="image-popup"
    :data-loaded="state.loaded"
    :data-mode="state.mode"
  >
    <!-- サムネイル画像 -->
    <div
      class="image"
      :style="`
        background-image: url(${state.loaded ? '' : smallUri});
        background-position: ${state.x * 100}% ${state.y * 100}%;
      `"
      @mousedown="startDrag"
      @touchstart.passive="startDrag"
      @mousemove="moveDrag"
      @touchmove.passive="moveDrag"
      @mouseup="endDrag"
      @touchend.passive="endDrag"
    >
      <!-- ラージ画像 -->
      <div
        class="image"
        :style="`
          background-image: url(${largeUri});
          background-position: ${state.x * 100}% ${state.y * 100}%;
        `"
      />
    </div>

    <!-- ラージ画像の読込判断用 img 要素 -->
    <img
      class="large-image-loader"
      :src="largeUri"
      @load="onLoadLargeImage"
    >

    <!-- 壁紙設定ボタン -->
    <button
      v-if="!state.isBlob"
      class="floating-button background-image-button"
      @click.prevent="setBackgroundImage"
    >
      <SVGIcon name="wallpaper" />
    </button>

    <!-- 閉じるボタン -->
    <button
      class="floating-button close-button"
      @click.prevent="close"
    >
      <SVGIcon name="cross" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.image-popup {
  background-color: rgba(0, 0, 0, 0.75);
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
  &[data-mode="false"] {
    padding: 1rem;
  }
}

// サムネイル画像 / ラージ画像
.image {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  cursor: grabbing;
  overscroll-behavior: none;
  position: relative;
  width: 100%;
  height: 100%;
  transition: background-position 100ms ease-out;
  [data-mode="false"] & {
    background-size: contain;
    cursor: grab;
  }
}

// ラージ画像の読込判断用 img 要素
.large-image-loader {
  display: contents;
}

// 壁紙設定ボタン / 閉じるボタン
.floating-button {
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 1rem;
  width: 4rem;
  min-height: 4rem;
  [data-mode="true"] & {
    display: none;
  }

  & > .svg-icon {
    fill: rgba(255, 255, 255, 0.75);
    font-size: 2rem;
  }

  &:focus, &:hover {
    background-color: rgba(0, 0, 0, 0.5);

    & > .svg-icon {
      fill: rgb(255, 255, 255);
    }
  }
}

// 壁紙設定ボタン
.background-image-button {
  right: 6rem;
  [data-loaded="false"] & {
    & > .svg-icon {
      fill: rgba(255, 255, 255, 0.25);
    }
  }
}

// 閉じるボタン
.close-button {
  right: 1rem;
}
</style>
