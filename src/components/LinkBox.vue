<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, type ComputedRef } from "vue"

const props = defineProps<{
  external: TTExternal
  displayImage?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  type: ComputedRef<string>
}>({
  type: computed((): string => {
    const settingValues = mainState.currentSetting.linkcardEmbeddedControl
    if (settingValues == null) return ""
    if (embeddedContentType === "giphy" && settingValues.includes("giphy")) return "giphy"
    if (embeddedContentType === "nicovideo" && settingValues.includes("nicovideo")) return "nicovideo"
    if (embeddedContentType === "spotify" && settingValues.includes("spotify")) return "spotify"
    if (embeddedContentType === "twitter" && settingValues.includes("twitter")) return "twitter"
    if (embeddedContentType === "youtube" && settingValues.includes("youtube")) return "youtube"
    return ""
  }),
})

const externalComponent = ref()

let embeddedContentType: null | string = null
let embeddedContentId: null | string = null
let SoptifyType: string = "album"

watch(() => mainState.currentSetting.linkcardEmbeddedControl, () => {
  nextTick(updateEmbeddedContents)
})

onMounted(updateEmbeddedContents)

function getEmbeddedContentId () {
  const url = new URL(props.external.uri)

  // Giphy 対応
  if (url.hostname.endsWith("giphy.com")) {
    const matches = url.pathname.match(/([0-9a-zA-Z]{10,})(?:$|\/)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "giphy"
      embeddedContentId = matches[1]
      return
    }
  }

  // Nicovideo 対応 1
  if (url.hostname === "www.nicovideo.jp") {
    const matches = url.pathname.match(/\/watch\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "nicovideo"
      embeddedContentId = matches[1]
      return
    }
  }

  // Spotify 対応
  if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/(album|artist|track)\/([^\/]+)/)
    if (matches != null && matches[1] != null && matches[2] != null) {
      embeddedContentType = "spotify"
      embeddedContentId = matches[2]
      SoptifyType = matches[1]
      return
    }
  }

  // Twitter 対応 1
  if (url.hostname === "twitter.com") {
    const matches = url.pathname.match(/\/status\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "twitter"
      embeddedContentId = matches[1]
      return
    }
  }

  // YouTube 対応
  if (
    url.hostname === "www.youtube.com" &&
    url.pathname === "/watch"
  ) {
    embeddedContentType = "youtube"
    embeddedContentId = url.searchParams.get("v")
    return
  } else if (
    url.hostname === "youtu.be" &&
    url.pathname
  ) {
    embeddedContentType = "youtube"
    embeddedContentId = url.pathname.substring(1)
    return
  }
}

function updateEmbeddedContents () {
  // Nicovideo 対応 2
  if (state.type === "nicovideo") {
    const parent = externalComponent.value.querySelector(".external--nicovideo")
    if (parent.children.length === 0) {
      const script = document.createElement("script")
      script.setAttribute("src", `https://embed.nicovideo.jp/watch/${embeddedContentId}/script`)
      parent.appendChild(script)
    }
  }

  // Twitter 対応 2
  // SEE: https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-javascript-factory-function
  else if (state.type === "twitter") {
    const parent = externalComponent.value.querySelector(".external--twitter")
    if (parent.children.length === 0) {
      ;(window as any).twttr?.widgets?.createTweet(embeddedContentId, parent, {
        dnt: true,
        theme: isDarkMode() ? "dark" : undefined,
      })
    }
  }
}

function isDarkMode (): boolean {
  return window.matchMedia != null
    ? window.matchMedia("(prefers-color-scheme: dark)")?.matches ?? false
    : false
}

getEmbeddedContentId()
</script>

<template>
  <div
    ref="externalComponent"
    class="external"
  >
    <a
      v-if="state.type === ''"
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
      v-else-if="state.type === 'giphy'"
      class="external--giphy"
      :src="`https://giphy.com/embed/${embeddedContentId}`"
      allowfullScreen
      frameBorder="0"
      loading="lazy"
      scrolling="no"
      width="100%"
      height="300"
    />

    <!-- Nicovideo 対応 -->
    <div
      v-else-if="state.type === 'nicovideo'"
      class="external--nicovideo"
    />

    <!-- Spotify 対応 -->
    <iframe
      v-else-if="state.type === 'spotify'"
      class="external--spotify"
      :src="`https://open.spotify.com/embed/${SoptifyType}/${embeddedContentId}?utm_source=generator`"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen
      frameborder="0"
      loading="lazy"
      scrolling="no"
      width="100%"
      :height="SoptifyType === 'album' ? 352 : 152"
    />

    <!-- Twitter 対応 -->
    <div
      v-else-if="state.type === 'twitter'"
      class="external--twitter twitter-tweet"
    />

    <!-- YouTube 対応 -->
    <iframe
      v-else-if="state.type === 'youtube'"
      class="external--youtube"
      :src="`https://www.youtube-nocookie.com/embed/${embeddedContentId}`"
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
  // Giphy 対応 - SP幅未満
  @media not all and (min-width: $sp-width) {
    &--giphy {
      aspect-ratio: 1 / 1;
      height: unset !important;
    }
  }

  // Nicovideo 対応
  &--nicovideo:deep() {
    iframe[src^="https://embed.nicovideo."] {
      aspect-ratio: 640 / 360;
      background-color: rgba(var(--fg-color), 0.125);
      border-radius: var(--border-radius);
      height: unset !important;
    }
  }

  // Spotify 対応
  &--spotify {
    background-color: rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
  }

  // Twitter 対応
  &--twitter:deep() {
    .twitter-tweet {
      margin: 0 !important;
      max-width: 100% !important;

      & > iframe {
        width: 100% !important;
      }
    }
  }

  // YouTube 対応
  &--youtube {
    aspect-ratio: 16 / 9;
    background-color: rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
  }
}
</style>
