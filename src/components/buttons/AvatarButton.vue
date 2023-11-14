<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"

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
    <LazyImage :src="image" />
  </button>
</template>

<style lang="scss" scoped>
.avatar {
  cursor: pointer;
  display: block;

  & > .lazy-image {
    border-radius: var(--border-radius-large);
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
    transition: border-radius 125ms ease-out;
  }
  &:hover > .lazy-image {
    border-radius: 1px;
  }
}
</style>
