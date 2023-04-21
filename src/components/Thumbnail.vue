<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/Loader.vue"

const props = defineProps<{
  image?: TTImage
  did?: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  src: null | string;
  loaded: boolean;
}>({
  src: null,
  loaded: false,
})

initializeSrc()

async function initializeSrc () {
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
    const data: null | Uint8Array = await mainState.atp.fetchBlob(cid, props.did)
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

  const data: null | Uint8Array = await mainState.atp.fetchBlob(link, props.did)
  if (data == null) {
    state.src = "/img/void.png"
    state.loaded = true
    return
  }
  state.src = URL.createObjectURL(new Blob([data], {
    type: props.image.image?.mimeType ?? "image/jpeg",
  }))
  state.loaded = true
}

function onActivateImage () {
  if (props.image == null) return
  if (!state.loaded) return
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
</script>

<template>
  <div class="thumbnail">
    <img
      loading="lazy"
      :src="state.src ?? '/img/void.png'"
      :alt="image?.alt ?? ''"
      @click.stop="onActivateImage"
    />
    <Loader
      v-if="!state.loaded"
      @click.stop
    />
  </div>
</template>

<style lanf="scss" scoped>
.thumbnail {
  position: relative;
}

.loader {
  font-size: 0.75rem;
}
</style>
