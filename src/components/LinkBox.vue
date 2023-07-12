<script lang="ts" setup>
import { onMounted, ref } from "vue"

const props = defineProps<{
  external: TTExternal
  displayImage?: boolean
}>()

const externalComponent = ref()

const url = new URL(props.external.uri)

// Giphy 対応
const GiphyId = ((): null | string => {
  if (url.hostname.endsWith("giphy.com")) {
    const matches = url.pathname.match(/([0-9a-zA-Z]{10,})(?:$|\/)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// Nicovideo 対応 1
const NicovideoId = ((): null | string => {
  if (url.hostname === "www.nicovideo.jp") {
    const matches = url.pathname.match(/\/watch\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// Spotify 対応
const SpotifyId = ((): null | string => {
  if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/track\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// Steam 対応
const SteamId = ((): null | string => {
  if (url.hostname === "store.steampowered.com") {
    const matches = url.pathname.match(/\/app\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// Twitter 対応 1
const TwitterId = ((): null | string => {
  if (url.hostname === "twitter.com") {
    const matches = url.pathname.match(/\/status\/([^\/]+)/)
    if (matches != null && matches[1] != null)
      return matches[1]
  }
  return null
})()

// YouTube 対応
const YouTubeId = ((): null | string => {
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

onMounted(() => {
  // Nicovideo 対応 2
  if (NicovideoId != null) {
    const script = document.createElement("script")
    script.setAttribute("src", `https://embed.nicovideo.jp/watch/${NicovideoId}/script`)
    externalComponent.value.appendChild(script)
  }

  // Twitter 対応 2
  // SEE: https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-javascript-factory-function
  if (TwitterId != null) {
    const target = externalComponent.value.querySelector(".external--twitter")
    ;(window as any).twttr?.widgets?.createTweet(TwitterId, target, {
      dnt: true,
      theme: isDarkMode() ? "dark" : undefined,
    })
  }
})

function isDarkMode (): boolean {
  return window.matchMedia != null
    ? window.matchMedia("(prefers-color-scheme: dark)")?.matches ?? false
    : false
}
</script>

<template>
  <div
    ref="externalComponent"
    class="external"
  >
    <a
      v-if="GiphyId == null && NicovideoId == null && SpotifyId == null && SteamId == null && TwitterId == null && YouTubeId == null"
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

    <!-- Giphy 対応 -->
    <iframe
      v-else-if="GiphyId != null"
      class="external--giphy"
      :src="`https://giphy.com/embed/${GiphyId}`"
      allowfullScreen
      frameBorder="0"
      loading="lazy"
      scrolling="no"
      width="100%"
      height="300"
    />

    <!-- Spotify 対応 -->
    <iframe
      v-else-if="SpotifyId != null"
      class="external--spotify"
      :src="`https://open.spotify.com/embed/track/${SpotifyId}?utm_source=generator`"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
      frameborder="0"
      loading="lazy"
      scrolling="no"
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
      scrolling="no"
      width="100%"
      height="190"
    />

    <!-- Twitter 対応 -->
    <div
      v-else-if="TwitterId != null"
      class="external--twitter twitter-tweet"
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
      scrolling="no"
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

  // Giphy 対応
  &--giphy {
    background-color: rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
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

<style lang="scss">
// Nicovideo 対応
.external > iframe[src^="https://embed.nicovideo."] {
  aspect-ratio: 548 / 362;
  border-radius: var(--border-radius);
}

// Twitter 対応
.twitter-tweet {
  margin: 0 !important;
  max-width: 100% !important;

  & > iframe {
    width: 100% !important;
  }
}
</style>
