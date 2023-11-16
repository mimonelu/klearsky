<script lang="ts" setup>
import LazyImage from "@/components/common/LazyImage.vue"

defineProps<{
  did?: string
  image?: string
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'profile-feeds', query: { account: did } }"
    class="avatar-link"
  >
    <LazyImage :src="image" />
  </RouterLink>
</template>

<style lang="scss" scoped>
.avatar-link {
  cursor: pointer;
  display: block;
  position: relative;

  & > .lazy-image {
    border-radius: var(--border-radius-large);
    display: block;
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
