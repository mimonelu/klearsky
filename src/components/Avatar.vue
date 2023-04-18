<script lang="ts" setup>
defineProps<{
  handle?: string
  image?: string
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'profile-post', query: { handle } }"
    class="avatar"
    @click.stop
  >
    <img
      loading="lazy"
      :src="image ?? '/img/void-avatar.png'"
    >
  </RouterLink>
</template>

<style lang="scss" scoped>
.avatar {
  cursor: pointer;
  display: block;
  height: 3em;

  & > img {
    border-radius: var(--border-radius);
    object-fit: cover;
    min-width: 1em;
    min-height: 1em;
  }
}
</style>
