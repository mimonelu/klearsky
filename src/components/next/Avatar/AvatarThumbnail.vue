<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"

defineProps<{
  image?: string
  isLabeler?: boolean
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <div
    class="avatar-thumbnail"
    :data-is-labeler="!!isLabeler"
  >
    <LazyImage :src="mainState.currentSetting.postAnonymization ? undefined : image" />
  </div>
</template>

<style lang="scss" scoped>
.avatar-thumbnail {
  background-color: rgb(var(--fg-color), 0.125);
  cursor: pointer;
  display: block;
  overflow: hidden;
  position: relative;
  transition: border-radius 125ms ease-out;
  &[data-is-labeler="false"] {
    border-radius: var(--border-radius-large);
  }
  &[data-is-labeler="true"] {
    border-radius: var(--border-radius-small);
  }
  &:hover {
    border-radius: 1px;
  }

  & > .lazy-image {
    display: block;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
  }
}
</style>
