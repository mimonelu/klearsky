<script lang="ts" setup>
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, type ComputedRef } from "vue"
import hotkeys from "hotkeys-js"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  did: string
  images: TTImagePopupPropsImages[]
  alts: string[]
  index: number
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isBlob: ComputedRef<boolean>
  blobs: Array<undefined | string>
  mode: boolean
  x: number
  y: number
}>({
  isBlob: computed((): boolean => {
    return props.images[props.index].largeUri.startsWith("blob:")
  }),
  blobs: [],
  mode: false,
  x: 0.5,
  y: 0.5,
})

onBeforeMount(() => {
  hotkeys("esc", close)
  hotkeys("left", () => { showImage(- 1) })
  hotkeys("right", () => { showImage(1) })

  props.images.forEach(async (image: TTImagePopupPropsImages, index: number) => {
    state.blobs[index] = undefined
    if (image.blob == null) {
      return
    }
    const url = await mainState.atp.fetchBlobUrl(props.did, image.blob)
    if (url instanceof Error) {
      state.blobs[index] = props.images[index]?.largeUri
      return
    }
    state.blobs[index] = url
  })
})

onBeforeUnmount(() => {
  hotkeys.unbind("esc")
  hotkeys.unbind("left")
  hotkeys.unbind("right")
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
  hideScroll()
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
  showScroll()
}

function showImage (indexAdding: number) {
  if (props.images[props.index + indexAdding] == null) return
  mainState.imagePopupProps.index = props.index + indexAdding
}

function setBackgroundImage () {
  Util.blurElement()
  if (state.isBlob) return
  if (mainState.currentSetting == null) return
  mainState.currentSetting.backgroundImage = props.images[props.index].largeUri
  mainState.saveSettings()
}

async function downloadImage (index: number) {
  Util.blurElement()
  const url = state.blobs[index] ?? props.images[index].largeUri
  const response = await Util.downloadImage(url)
  if (response instanceof Error) {
    mainState.openErrorPopup($t(response.message), "ImagePopup/downloadImage")
  }
}

function hideScroll () {
  // TODO: やや危険、別の方法を模索すること
  window.document.body.style.overflowX = "hidden"
  window.document.body.style.overflowY = "hidden"
}

function showScroll () {
  // TODO: やや危険、別の方法を模索すること
  window.document.body.style.overflowX = ""
  window.document.body.style.overflowY = ""
}

function close () {
  Util.blurElement()
  showScroll()
  emit("close")
}
</script>

<template>
  <div
    class="image-popup"
    :data-mode="state.mode"
  >
    <!-- サムネイル画像 -->
    <div
      class="image"
      :style="`
        background-image: url(${
          images[index].blob != null
            ? state.blobs[index] != null
              ? ''
              : images[index].smallUri
            : images[index].smallUri
        });
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
          background-image: url(${
            images[index].blob != null
              ? state.blobs[index] ?? ''
              : images[index].largeUri
          });
          background-position: ${state.x * 100}% ${state.y * 100}%;
        `"
      />
    </div>

    <!-- Alt -->
    <div class="alt">{{ alts[index] }}</div>

    <Loader v-if="images[index].blob != null && state.blobs[index] == null" />

    <!-- 前の画像ボタン -->
    <button
      class="floating-button previous-image-button"
      :disabled="index === 0"
      @click.prevent="showImage(- 1)"
    >
      <SVGIcon name="arrowLeft" />
    </button>

    <!-- 次の画像ボタン -->
    <button
      class="floating-button next-image-button"
      :disabled="index + 1 === images.length"
      @click.prevent="showImage(1)"
    >
      <SVGIcon name="arrowRight" />
    </button>

    <!-- 壁紙設定ボタン -->
    <button
      v-if="!state.isBlob"
      class="floating-button background-image-button"
      @click.prevent="setBackgroundImage"
    >
      <SVGIcon name="wallpaper" />
    </button>

    <!-- 画像を別タブで開くボタン -->
    <button
      class="floating-button open-image-button"
      @click.prevent="downloadImage(index)"
    >
      <SVGIcon name="openInNew" />
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
  background-color: rgb(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overscroll-behavior: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2;
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

.loader {
  pointer-events: none;
}

.alt {
  color: white;
  line-height: var(--line-height-high);
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;

  // 非SPレイアウト
  @include media-not-sp-layout() {
    margin-top: 1rem;
  }

  // SPレイアウト
  @include media-sp-layout() {
    font-size: 0.875rem;
    margin: 1rem 0 calc(5rem + env(safe-area-inset-bottom));
  }

  &:empty,
  [data-mode="true"] & {
    display: none;
  }
}

// 壁紙設定ボタン / 画像を別タブで開くボタン / 閉じるボタン
.floating-button {
  background-color: rgb(0, 0, 0, 0.25);
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 4rem;
  min-height: 4rem;
  &:disabled,
  &[disabled="true"] {
    opacity: 0.25;
  }
  [data-mode="true"] & {
    display: none;
  }

  & > .svg-icon {
    fill: rgb(255, 255, 255, 0.75);
    font-size: 2rem;
  }

  &:focus, &:hover {
    background-color: rgb(0, 0, 0, 0.5);

    & > .svg-icon {
      fill: rgb(255, 255, 255);
    }
  }
}

// 前の画像ボタン
.previous-image-button {
  // 非SPレイアウト
  @include media-not-sp-layout() {
    left: 1rem;
  }

  // SPレイアウト
  @include media-sp-layout() {
    bottom: calc(1rem + env(safe-area-inset-bottom));
    left: 1rem;
  }
}

// 次の画像ボタン
.next-image-button {
  // 非SPレイアウト
  @include media-not-sp-layout() {
    right: 1rem;
  }

  // SPレイアウト
  @include media-sp-layout() {
    bottom: calc(1rem + env(safe-area-inset-bottom));
    left: 6rem;
  }
}

// 壁紙設定ボタン / 画像を別タブで開くボタン
.background-image-button,
.open-image-button {
  & > .svg-icon {
    fill: rgb(255, 255, 255, 0.25);
  }
}

// 壁紙設定ボタン
.background-image-button {
  top: 1rem;
  left: 1rem;
}

// 画像を別タブで開くボタン
.open-image-button {
  top: 1rem;
  left: 6rem;
}

// 閉じるボタン
.close-button {
  // 非SPレイアウト
  @include media-not-sp-layout() {
    top: 1rem;
    right: 1rem;
  }

  // SPレイアウト
  @include media-sp-layout() {
    bottom: calc(1rem + env(safe-area-inset-bottom));
    right: 1rem;
  }
}
</style>
