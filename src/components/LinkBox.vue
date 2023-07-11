<script lang="ts" setup>
const props = defineProps<{
  external: TTExternal
  displayImage?: boolean
}>()

// YouTube 対応
const YouTubeId = ((): null | string => {
  const url = new URL(props.external.uri)
  if (
    url.hostname === "www.youtube.com" &&
    url.pathname === "/watch"
  ) {
    return url.searchParams.get("v")
  } else if (
    url.hostname === "youtu.be" &&
    url.pathname
  ) {
    return url.pathname.substring(1)
  }
  return null
})()
</script>

<template>
  <div class="external">
    <a
      v-if="YouTubeId == null"
      class="external--default"
      :href="external.uri"
      rel="noreferrer"
      target="_blank"
      @click.stop
    >
      <img
        v-if="displayImage && typeof external.thumb === 'string'"
        class="external--default__thumb"
        loading="lazy"
        :src="external.thumb"
        alt=""
      />
      <div class="external--default__meta">
        <div class="external--default__title">{{ external.title ?? '' }}</div>
        <div class="external--default__uri">{{ external.uri }}</div>
        <div class="external--default__description">{{ external.description ?? '' }}</div>
      </div>
    </a>

    <!-- YouTube 対応 -->
    <iframe
      v-else
      class="external--video"
      width="100%"
      :src="`https://www.youtube-nocookie.com/embed/${YouTubeId}`"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
  </div>
</template>

<style lang="scss" scoped>
.external {
  &--default {
    background-color: rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
    cursor: pointer;
    display: block;
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

  // YouTube 対応
  &--video {
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius);
  }
}
</style>
