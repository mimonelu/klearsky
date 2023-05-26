<script lang="ts" setup>
import { inject } from "vue"

const props = defineProps<{
  handle?: string
  image?: string
}>()

const mainState = inject("state") as MainState

function openImagePopup () {
  if (!props.image) return
  mainState.imagePopupProps.images = [{
    largeUri: props.image,
    smallUri: "",
  }]
  mainState.imagePopupProps.index = 0
  mainState.imagePopupProps.display = true
}
</script>

<template>
  <button
    class="avatar"
    @click.stop="openImagePopup"
  >
    <img
      loading="lazy"
      :src="image ?? '/img/void-avatar.png'"
      alt=""
    >
  </button>
</template>

<style lang="scss" scoped>
.avatar {
  cursor: pointer;
  display: block;

  & > img {
    border-radius: var(--border-radius);
    display: block;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
  }
}
</style>
