<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"

const props = defineProps<{
  isLabeler?: boolean
  image?: string
}>()

const mainState = inject("state") as MainState

function openImagePopup () {
  if (!props.image) return
  mainState.imagePopupProps.images = [{
    largeUri: props.image,
    smallUri: "",
  }]
  mainState.imagePopupProps.alts = [""]
  mainState.imagePopupProps.index = 0
  mainState.imagePopupProps.display = true
}
</script>

<template>
  <button
    class="avatar"
    :data-is-labeler="!!isLabeler"
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
    background-color: rgb(var(--bg-color));
    box-shadow: 0 0 0 4px rgb(var(--bg-color));
    opacity: 0;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
    transition: border-radius 125ms ease-out;
  }
  &[data-is-labeler="false"] > .lazy-image {
    border-radius: var(--border-radius-large);
  }
  &[data-is-labeler="true"] > .lazy-image {
    border-radius: var(--border-radius-small);
  }
  &:hover > .lazy-image {
    border-radius: 1px;
  }
}
</style>
