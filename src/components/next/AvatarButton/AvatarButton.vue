<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"

defineProps<{
  did?: string
  image?: string
  isLabeler?: boolean
  noLink?: boolean
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <Component
    :is="noLink ? 'div' : 'RouterLink'"
    :to="{ name: 'profile-feeds', query: { account: did } }"
    class="avatar-button"
    :data-is-labeler="!!isLabeler"
  >
    <LazyImage :src="mainState.currentSetting.postAnonymization ? undefined : image" />
  </Component>
</template>

<style lang="scss" scoped>
.avatar-button {
  background-color: rgb(var(--fg-color), 0.125);
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

  & > .lazy-image {
    display: block;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
  }
}
a.avatar-button {
  cursor: pointer;

  &:hover {
    border-radius: 1px;
  }
}
</style>
