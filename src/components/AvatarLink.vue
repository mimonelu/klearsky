<script lang="ts" setup>
defineProps<{
  handle?: string
  image?: string
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'profile-post', query: { handle } }"
    class="avatar-link"
  >
    <img
      loading="lazy"
      :src="image ?? '/img/void-avatar.png'"
    >
  </RouterLink>
</template>

<style lang="scss" scoped>
.avatar-link {
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
