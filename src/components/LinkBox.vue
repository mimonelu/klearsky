<script lang="ts" setup>
defineProps<{
  external?: TTExternal
  displayImage?: boolean
}>()
</script>

<template>
  <a
    v-if="external != null"
    class="external"
    :href="external.uri"
    rel="noreferrer"
    target="_blank"
    @click.stop
  >
    <img
      v-if="displayImage && typeof external.thumb === 'string'"
      class="external__thumb"
      loading="lazy"
      :src="external.thumb"
      alt=""
    />
    <div class="external__meta">
      <div class="external__title">{{ external.title ?? '' }}</div>
      <div class="external__uri">{{ external.uri }}</div>
      <div class="external__description">{{ external.description ?? '' }}</div>
    </div>
  </a>
</template>

<style lang="scss" scoped>
.external {
  background-color: rgba(var(--fg-color), 0.125);
  border-radius: var(--border-radius);
  cursor: pointer;
  overflow: hidden;
  position: relative;
  height: 100%;

  &__thumb {
    aspect-ratio: 1.91 / 1;
    display: block;
    object-fit: cover;
    width: 100%;
    min-height: 100%;
  }
  &__meta {
    display: grid;
    grid-template-rows: auto auto auto;
    padding: 0.75em;
  }
  &__title,
  &__uri,
  &__description {
    line-height: var(--line-height);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__title {
    font-weight: bold;
  }
  &__uri {
    color: rgba(var(--fg-color), 0.5);
    font-size: 0.75em;
  }
  &__description {
    font-size: 0.875em;
  }
}
</style>
