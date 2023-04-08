<script lang="ts" setup>
defineProps<{
  user: TTUser
}>()
</script>

<template>
  <div class="user-box">
    <RouterLink
      class="avatar"
      :to="{ path: '/profile/post', query: { handle: user.handle } }"
      @click.prevent
    >
      <img
        loading="lazy"
        :src="user.avatar ?? '/img/void-avatar.png'"
      >
    </RouterLink>
    <div class="display-name">{{ user.displayName }}</div>
    <div class="handle">{{ user.handle }}</div>
    <div class="description">{{ user.description }}</div>
    <div class="bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-box {
  display: grid;
  grid-gap: 0 0.5rem;
  grid-template-columns: min-content auto 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "a n h"
    "a d d"
    "b b b";
  align-items: center;
  padding: 0 1rem;
}

.avatar {
  grid-area: a;
  @include avatar-link(3rem);
}

.display-name {
  grid-area: n;
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

.handle {
  grid-area: h;
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  grid-area: d;
  font-size: 0.875rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom {
  grid-area: b;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:not(:empty) {
    margin-top: 0.25rem;
  }
}
</style>
