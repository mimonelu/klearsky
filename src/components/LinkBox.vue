<script lang="ts" setup>
const props = defineProps<{
  external: TTExternal
  displayImage?: boolean
}>()

// Spotify 対応
const SpotifyId = ((): null | string => {
  const url = new URL(props.external.uri)
  if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/track\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// Steam 対応
const SteamId = ((): null | string => {
  const url = new URL(props.external.uri)
  if (url.hostname === "store.steampowered.com") {
    const matches = url.pathname.match(/\/app\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

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
      v-if="SpotifyId == null && SteamId == null && YouTubeId == null"
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

    <!-- Spotify 対応 -->
    <iframe
      v-else-if="SpotifyId != null"
      class="external--spotify"
      :src="`https://open.spotify.com/embed/track/${SpotifyId}?utm_source=generator`"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
      frameborder="0"
      loading="lazy"
      width="100%"
      height="152"
    />

    <!-- Steam 対応 -->
    <iframe
      v-else-if="SteamId != null"
      class="external--steam"
      :src="`https://store.steampowered.com/widget/${SteamId}/`"
      frameborder="0"
      loading="lazy"
      width="100%"
      height="190"
    />

    <!-- YouTube 対応 -->
    <iframe
      v-else-if="YouTubeId != null"
      class="external--youtube"
      :src="`https://www.youtube-nocookie.com/embed/${YouTubeId}`"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      frameborder="0"
      loading="lazy"
      width="100%"
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

  // Spotify 対応
  &--spotify {
    border-radius: var(--border-radius);
  }

  // YouTube 対応
  &--youtube {
    aspect-ratio: 16 / 9;
    border-radius: var(--border-radius);
  }
}
</style>
