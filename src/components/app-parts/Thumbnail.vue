<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  image?: TTImage
  did?: string
  hasAspectRatio?: boolean
  hasTranslateLink?: boolean
  blurred?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  src: null | string;
  loaded: boolean;
  errored: boolean;
}>({
  src: null,
  loaded: false,
  errored: false,
})

onMounted(async () => {
  if (props.image == null) return
  if (typeof props.image === "string") {
    state.src = props.image
    state.loaded = true
    return
  }
  if (props.image.thumb != null) {
    state.src = props.image.thumb
    state.loaded = true
    return
  }

  const ref = props.image.image?.ref
  if (ref == null) {
    state.src = "/img/void.png"
    state.loaded = true
    return
  }

  const link = ref.$link

  if (link == null) {
    const cid = ref.toString()
    const data: null | Uint8Array = await fetchBlob(cid)
    if (data == null) {
      state.src = "/img/void.png"
      state.loaded = true
      return
    }
    state.src = URL.createObjectURL(new Blob([data], {
      type: props.image.image?.mimeType ?? "image/jpeg",
    }))
    state.loaded = true
    return
  }

  const data: null | Uint8Array = await fetchBlob(link)
  if (data == null) {
    state.src = "/img/void.png"
    state.loaded = true
    return
  }
  state.src = URL.createObjectURL(new Blob([data], {
    type: props.image.image?.mimeType ?? "image/jpeg",
  }))
  state.loaded = true
})

// Blob 画像のみキャッシュ
async function fetchBlob (link: string): Promise<null | Uint8Array> {
  let data: null | Uint8Array = Util.cache.get(link)
  if (data != null) return data
  data = await mainState.atp.fetchBlob(link, props.did)
  state.errored = data == null
  Util.cache.set(link, data)
  return data
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
  <div
    class="thumbnail"
    :data-has-aspect-ratio="hasAspectRatio"
    :data-blurred="blurred"
  >
    <LazyImage
      :src="state.src ?? undefined"
      :alt="image?.alt"
    />
    <button
      v-if="image?.alt"
      class="button--invert alt-button"
      @click.prevent.stop="onActivateAlt(image.alt)"
    >
      <span>ALT</span>
    </button>

    <!-- blur-media 対応 -->
    <div
      v-if="blurred"
      class="blurred"
    >
      <SVGIcon name="contentFiltering" />
      <p>{{ $t("showBlurredMedia") }}</p>
    </div>

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
  background-color: var(--fg-color-0125);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  & > .lazy-image {
    display: block;
    object-fit: cover;
  }

  // blur-media 対応
  &[data-blurred="true"] > .lazy-image {
    visibility: hidden;
  }

  // アスペクト比の調節あり
  &[data-has-aspect-ratio="true"] > .lazy-image {
    aspect-ratio: var(--image-aspect-ratio);
  }

  // アスペクト比の調節なし（＝添付画像が1枚だけの場合）
  &[data-has-aspect-ratio="false"] > .lazy-image {
    min-height: calc(2em + 4px); // NOTICE: ALTボタンを考慮

    // TODO: 暫定対応
    max-height: 200vh;
  }
}

.alt-button {
  border-radius: var(--border-radius);
  font-size: 0.75em;
  position: absolute;
  bottom: 2px;
  left: 2px;
}

// blur-media 対応
.blurred {
  background-color: var(--fg-color-0125);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-gap: 0.25em;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  user-select: none;

  & > .svg-icon {
    fill: rgb(var(--notice-color));
    font-size: 1.5em;
  }

  & > p {
    color: rgb(var(--notice-color));
    font-size: 0.75em;
    font-weight: bold;
    padding: 0 1em;
    word-break: break-word;
  }
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
