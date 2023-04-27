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
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  cursor: pointer;
  overflow: hidden;
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.5);
  }

  &__thumb {
    aspect-ratio: 1.91 / 1;
    display: block;
    object-fit: cover;
  }
  &__meta {
    display: grid;
    grid-template-rows: auto auto auto;
    padding: 0.875em;
  }
  &__title,
  &__uri,
  &__description {
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__title {
    font-weight: bold;
  }
  &__uri {
    color: rgba(var(--fg-color), 0.5);
    font-size: 0.875em;
  }
  &__description {
    font-size: 0.875em;
  }
}
</style>
