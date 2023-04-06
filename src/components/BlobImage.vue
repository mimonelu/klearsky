<script lang="ts" setup>
import { inject, reactive } from "vue"

const props = defineProps<{
  image?: TTImage
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
  const link = props.image.image?.ref?.$link
  if (link == null) {
    state.src = "/img/void.png"
    state.loaded = true
    return
  }
  const data: null | Uint8Array = await mainState.atp.fetchBlob(link)
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
  <img
    loading="lazy"
    :src="state.src ?? '/img/void.png'"
    :alt="image?.alt ?? ''"
    @click.stop="onActivateImage"
  />
</template>
