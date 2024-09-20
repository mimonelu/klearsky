<script lang="ts" setup>
import { computed, inject, onMounted, reactive, type ComputedRef } from "vue"
import type { BlobRef } from "@atproto/api"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  image?: TTImage
  did?: string
  hasTranslateLink?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  src: null | string
  loaded: boolean
  errored: boolean

  // 画像のアスペクト比
  aspectRatio: ComputedRef<string>
}>({
  src: null,
  loaded: false,
  errored: false,

  // 画像のアスペクト比
  aspectRatio: computed((): string => {
    if (props.image?.aspectRatio == null) {
      return "unset"
    }
    const aspectHeight = props.image.aspectRatio.height / props.image.aspectRatio.width
    if (!mainState.currentSetting.imageMaxHeightRatio) {
      return `1 / ${aspectHeight}`
    }
    const computedHeight = Math.min(
      aspectHeight,
      mainState.currentSetting.imageMaxHeightRatio
    )
    return `1 / ${computedHeight}`
  }),
})

const BLOB_MIME_TYPES = [
  "image/apng",
  "image/gif",
  "image/svg+xml",
  "image/webp"
]

onMounted(async () => {
  if (props.image == null) return

  if (typeof props.image === "string") {
    state.src = props.image
    state.loaded = true
    return
  }

  // アニメーション画像向け対応
  // ※指定された MIME の画像は blob を表示する
  if (props.image.image != null &&
      mainState.currentSetting.imageAutoPlay &&
      BLOB_MIME_TYPES.includes(props.image.image.mimeType)) {
    setBlobToSrc(props.image.image as unknown as BlobRef)
    return
  }

  // サムネイル URL　があれば表示する
  if (props.image.thumb != null) {
    state.src = props.image.thumb
    state.loaded = true
    return
  }

  setBlobToSrc(props.image.image as unknown as BlobRef)
})

async function setBlobToSrc (image: BlobRef) {
  const url = await mainState.atp.fetchBlobUrl(props.did as string, image)
  state.errored = url instanceof Error
  if (url instanceof Error) {
    state.src = props.image?.thumb ?? "/img/void.png"
    state.loaded = true
    return
  }
  state.src = url
  state.loaded = true
}

function onActivateAlt (alt: string) {
  Util.blurElement()
  mainState.openMessagePopup({
    title: $t("alt"),
    text: alt,
    hasTranslateLink: props.hasTranslateLink,
  })
}
</script>

<template>
  <div class="thumbnail">
    <LazyImage
      :src="state.src ?? undefined"
      :alt="image?.alt"
      :style="{ 'aspect-ratio': state.aspectRatio }"
    />
    <button
      v-if="image?.alt"
      class="button--invert alt-button"
      @click.prevent.stop="onActivateAlt(image.alt)"
    >
      <span>ALT</span>
    </button>
    <div
      v-if="state.errored"
      class="error"
    >
      <SVGIcon name="alert" />
    </div>
    <Loader
      v-if="!state.loaded"
      @click.stop
    />
  </div>
</template>

<style lang="scss" scoped>
.thumbnail {
  background-color: rgb(var(--fg-color), 0.125);
  border: 1px solid rgb(var(--fg-color), 0.25);
  border-radius: var(--border-radius-middle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  & > .lazy-image {
    display: block;
    object-fit: cover;
    min-height: calc(2em + 4px); // NOTICE: ALTボタンを考慮

    // TODO: 暫定対応
    max-height: 400vh;
  }
}

.alt-button {
  border-radius: var(--border-radius-middle);
  font-size: 0.75em;
  position: absolute;
  bottom: 2px;
  left: 2px;
}

.error {
  background-color: rgb(var(--bg-color), 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  & > .svg-icon {
    fill: rgb(var(--notice-color));
    font-size: 2em;
  }
}

.loader {
  font-size: 0.75em;
  z-index: unset;
}
</style>
