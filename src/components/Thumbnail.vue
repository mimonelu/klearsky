<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const props = defineProps<{
  image?: TTImage
  did?: string
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

function onActivateImage () {
  if (props.image == null) return
  if (!state.loaded) return
  if (state.errored) return
  mainState.imagePopupProps.smallUri = props.image.thumb != null
    ? props.image.thumb
    : state.loaded
      ? state.src as string
      : "/img/void.png"
  mainState.imagePopupProps.largeUri = props.image.fullsize != null
    ? props.image.fullsize
    : state.loaded
      ? state.src as string
      : "/img/void.png"
  mainState.imagePopupProps.display = true
}

function onActivateAlt (alt: string) {
  Util.blurElement()
  mainState.openMessagePopup($t("alt"), alt)
}
</script>

<template>
  <div class="thumbnail">
    <img
      loading="lazy"
      :src="state.src ?? '/img/void.png'"
      :alt="image?.alt ?? ''"
      @click.prevent.stop="onActivateImage"
    />
    <button
      v-if="image?.alt"
      class="button alt-button"
      @click.prevent.stop="onActivateAlt(image.alt)"
    >ALT</button>
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
  position: relative;
}

.alt-button {
  border-radius: 0 var(--border-radius) 0 0;
  font-size: 0.75em;
  position: absolute;
  bottom: 0;
  left: 0;
}

.error {
  background-color: rgba(var(--bg-color), 0.5);
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
