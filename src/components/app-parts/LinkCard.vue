<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, type ComputedRef } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

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
    if (embeddedContentType === "applemusic" && settingValues.includes("applemusic")) return "applemusic"
    if (embeddedContentType === "giphy" && settingValues.includes("giphy")) return "giphy"
    if (embeddedContentType === "graysky" && settingValues.includes("graysky")) return "graysky"
    if (embeddedContentType === "nicovideo" && settingValues.includes("nicovideo")) return "nicovideo"
    if (embeddedContentType === "spotify" && settingValues.includes("spotify")) return "spotify"
    if (embeddedContentType === "twitch" && settingValues.includes("twitch")) return "twitch"
    if (embeddedContentType === "youtube" && settingValues.includes("youtube")) return "youtube"
    if (embeddedContentType === "vimeo" && settingValues.includes("vimeo")) return "vimeo"
    return ""
  }),
})

const externalComponent = ref()

let isInvalidUrl = false
let embeddedContentType: null | string = null
let embeddedContentId: null | string = null
const klearskyHostname = window.location.hostname
let SoptifyType: string = "album"

watch(() => mainState.currentSetting.linkcardEmbeddedControl, () => {
  nextTick(updateEmbeddedContents)
})

onMounted(updateEmbeddedContents)

function getEmbeddedContentId () {
  let url: undefined | URL
  try {
    url = new URL(props.external.uri)
  } catch (error) {
    isInvalidUrl = true
    return
  }
  if (url == null) return

  // Apple Music 対応
  if (url.hostname.endsWith("music.apple.com")) {
    const matches = url.pathname.match(/^\/([^?].+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "applemusic"
      embeddedContentId = matches[1]
      return
    }
  }

  // Giphy 対応
  else if (url.hostname.endsWith("giphy.com")) {
    const matches = url.pathname.match(/([0-9a-zA-Z]{10,})(?:$|\/)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "giphy"
      embeddedContentId = matches[1]
      return
    }
  }

  // Graysky 対応
  else if (url.hostname.endsWith("graysky.app")) {
    const matches = url.pathname.match(/\/gif\/(.+?)\.mp4/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "graysky"
      embeddedContentId = matches[1]
      console.log(embeddedContentId)
      return
    }
  }

  // Nicovideo 対応 1
  else if (url.hostname === "www.nicovideo.jp") {
    const matches = url.pathname.match(/\/watch\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "nicovideo"
      embeddedContentId = matches[1]
      return
    }
  }

  // Spotify 対応
  else if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/(album|artist|track)\/([^\/]+)/)
    if (matches != null && matches[1] != null && matches[2] != null) {
      embeddedContentType = "spotify"
      embeddedContentId = matches[2]
      SoptifyType = matches[1]
      return
    }
  }

  // Twitch 対応
  else if (url.hostname === "www.twitch.tv") {
    const matches = url.pathname.match(/^\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "twitch"
      embeddedContentId = matches[1]
      return
    }
  }

  // YouTube 対応
  else if (
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

  // Vimeo 対応
  else if (url.hostname === "vimeo.com") {
    const matches = url.pathname.match(/^\/([^?]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "vimeo"
      embeddedContentId = matches[1]
      return
    }
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
}

getEmbeddedContentId()
</script>

<template>
  <div
    ref="externalComponent"
    class="external"
  >
    <!-- 不正な URL -->
    <div
      v-if="isInvalidUrl"
      class="external--default external--invalid textlabel--alert"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("invalidUrlError") }}
      </div>
    </div>

    <a
      v-else-if="state.type === ''"
      class="external--default"
      :href="external.uri"
      rel="noreferrer"
      target="_blank"
      @click.stop
    >
      <LazyImage
        v-if="displayImage && typeof external.thumb === 'string'"
        :src="external.thumb"
      />
      <div class="external__meta">
        <div class="external__meta__title">{{ external.title ?? '' }}</div>
        <div class="external__meta__uri">{{ external.uri }}</div>
        <div class="external__meta__description">{{ external.description ?? '' }}</div>
      </div>
    </a>
    <div v-else>
      <!-- Apple Music 対応 -->
      <iframe
        v-if="state.type === 'applemusic'"
        class="external--applemusic"
        :src="`https://embed.music.apple.com/${embeddedContentId}`"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        allowfullScreen
        frameBorder="0"
        loading="lazy"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        scrolling="no"
        width="100%"
        height="450"
      />

      <!-- Giphy 対応 -->
      <iframe
        v-if="state.type === 'giphy'"
        class="external--giphy"
        :src="`https://giphy.com/embed/${embeddedContentId}`"
        allowfullScreen
        frameBorder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
        height="300"
      />

      <!-- Graysky 対応 -->
      <video
        v-if="state.type === 'graysky'"
        class="external--graysky"
        autoplay
        controls
        loading="lazy"
        loop
        muted
        :poster="external.thumb"
        preload="metadata"
        height="300"
      >
        <source
          :src="`https://media.tenor.com/${embeddedContentId}.mp4`"
          type="video/mp4"
        />
      </video>

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

      <!-- Twitch 対応 -->
      <iframe
        v-else-if="state.type === 'twitch'"
        class="external--twitch"
        :src="`https://player.twitch.tv/?channel=${embeddedContentId}&parent=${klearskyHostname}&autoplay=false`"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
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

      <!-- Vimeo 対応 -->
      <iframe
        v-else-if="state.type === 'vimeo'"
        class="external--vimeo"
        :src="`https://player.vimeo.com/video/${embeddedContentId}`"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
      />

      <a
        class="external__meta--special"
        :href="external.uri"
        rel="noreferrer"
        target="_blank"
        @click.stop
      >
        <div class="external__meta__title">{{ external.title ?? '' }}</div>
        <div class="external__meta__uri">{{ external.uri }}</div>
        <div class="external__meta__description">{{ external.description ?? '' }}</div>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.external {
  &--default {
    background-color: var(--fg-color-0125);
    border: 1px solid var(--fg-color-025);
    border-radius: var(--border-radius);
    cursor: pointer;
    display: block;
    overflow: hidden;
    position: relative;
    height: 100%;
    &:focus, &:hover {
      border-color: var(--fg-color-0375);
    }

    .lazy-image {
      aspect-ratio: 1.91 / 1;
      object-fit: cover;
      width: 100%;
      min-height: 100%;
    }
  }

  &--invalid {
    padding: 0.75em 0.75em 0.5em;
    pointer-events: none;
  }

  &__meta {
    display: grid;
    grid-template-rows: auto auto auto;
    padding: 0.75em;

    &--special {
      display: grid;
      grid-template-rows: auto auto auto;
      margin-top: 0.5em;
      &:focus, &:hover {
        --fg-color: var(--accent-color);
      }
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
      color: rgb(var(--fg-color));
      font-weight: bold;
    }

    &__uri {
      color: var(--fg-color-05);
      font-size: 0.75em;
    }

    &__description {
      color: var(--fg-color-075);
      font-size: 0.875em;
    }
  }

  // Apple Music 対応
  &--applemusic {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }

  // Giphy 対応
  &--giphy {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }
  // Giphy 対応 - SP幅未満
  @media not all and (min-width: $sp-width) {
    &--giphy {
      aspect-ratio: 1 / 1;
      height: unset !important;
    }
  }

  // Graysky 対応
  &--graysky {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
    width: 100%;
  }

  // Nicovideo 対応
  &--nicovideo:deep() {
    iframe[src^="https://embed.nicovideo."] {
      aspect-ratio: 640 / 360;
      background-color: var(--fg-color-0125);
      border-radius: var(--border-radius);
      height: unset !important;
    }
  }

  // Spotify 対応
  &--spotify {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }

  // Twitch 対応
  &--twitch {
    aspect-ratio: 1 / 0.6;
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }

  // YouTube 対応
  &--youtube {
    aspect-ratio: 16 / 9;
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }

  // Vimeo 対応
  &--vimeo {
    aspect-ratio: 4 / 3;
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius);
  }
}
</style>
