<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, type ComputedRef } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  external: TTExternal
  layout?: "none" | "horizontal" | "vertical"
  displayImage?: boolean
  noLink?: boolean
  noEmbedded?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  type: ComputedRef<string>
}>({
  type: computed((): string => {
    if (props.noEmbedded) return ""
    const settingValues = mainState.currentSetting.linkcardEmbeddedControl
    if (settingValues == null) return ""
    if (embeddedContentType === "applemusic" && settingValues.includes("applemusic")) return "applemusic"
    if (embeddedContentType === "giphy" && settingValues.includes("giphy")) return "giphy"
    if (embeddedContentType === "graysky" && settingValues.includes("graysky")) return "graysky"
    if (embeddedContentType === "nicovideo" && settingValues.includes("nicovideo")) return "nicovideo"
    if (embeddedContentType === "spotify" && settingValues.includes("spotify")) return "spotify"
    if (embeddedContentType === "tenor" && settingValues.includes("tenor")) return "tenor"
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
  const url: undefined | URL = Util.safeUrl(props.external.uri)
  if (url == null) {
    isInvalidUrl = true
    return
  }

  // 埋込型リンクカード - Apple Music
  if (url.hostname.endsWith("music.apple.com")) {
    const matches = url.pathname.match(/^\/([^?].+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "applemusic"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Giphy
  else if (url.hostname.endsWith("giphy.com")) {
    const matches = url.pathname.match(/([0-9a-zA-Z]{10,})(?:$|\/)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "giphy"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Graysky
  else if (url.hostname.endsWith("graysky.app")) {
    const matches = url.pathname.match(/\/gif\/(.+?)\.mp4/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "graysky"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Nicovideo 1
  else if (url.hostname === "www.nicovideo.jp") {
    const matches = url.pathname.match(/\/watch\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "nicovideo"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Spotify
  else if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/(album|artist|track)\/([^\/]+)/)
    if (matches != null && matches[1] != null && matches[2] != null) {
      embeddedContentType = "spotify"
      embeddedContentId = matches[2]
      SoptifyType = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Tenor
  // e.g. https://media.tenor.com/3GgX9XG4fe0AAAAC/blue-fly.gif?hh=280&ww=498
  else if (url.hostname.endsWith(".tenor.com")) {
    embeddedContentType = "tenor"
    embeddedContentId = url.href
    return
  }

  // 埋込型リンクカード - Twitch
  else if (url.hostname === "www.twitch.tv") {
    const matches = url.pathname.match(/^\/([^\/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "twitch"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - YouTube
  else if (
    (
      url.hostname === "www.youtube.com" ||
      url.hostname === "music.youtube.com"
    ) &&
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

  // 埋込型リンクカード - Vimeo
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
  // 埋込型リンクカード - Nicovideo 2
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
      class="external--invalid textlabel"
    >
      <div class="textlabel__text--alert">
        <SVGIcon name="alert" />{{ $t("invalidUrlError") }}
      </div>
    </div>

    <!-- 通常のリンクカード -->
    <Component
      v-else-if="state.type === ''"
      :is="noLink ? 'div' : 'a'"
      class="external--default"
      :data-layout="layout"
      :href="external.uri"
      rel="noreferrer"
      target="_blank"
      @click.stop
    >
      <LazyImage
        v-if="
          displayImage &&
          layout !== 'none' &&
          typeof external.thumb === 'string'
        "
        :src="external.thumb"
      />

      <!-- 通常のリンクカードの情報 -->
      <div class="external__meta">
        <div class="external__meta__title">
          <span>{{ external.title || "&emsp;" }}</span>
        </div>
        <div class="external__meta__uri">
          <SVGIcon name="link" />
          <span>{{ external.uri }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ external.description || "&emsp;" }}</span>
        </div>
      </div>
    </Component>

    <!-- 埋込型リンクカード -->
    <div v-else>
      <!-- 埋込型リンクカード - Apple Music -->
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

      <!-- 埋込型リンクカード - Giphy -->
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

      <!-- 埋込型リンクカード - Graysky -->
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

      <!-- 埋込型リンクカード - Nicovideo -->
      <div
        v-else-if="state.type === 'nicovideo'"
        class="external--nicovideo"
      />

      <!-- 埋込型リンクカード - Spotify -->
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

      <!-- 埋込型リンクカード - Tenor -->
      <div
        v-else-if="state.type === 'tenor'"
        class="external--tenor"
      >
        <img
          :src="embeddedContentId as string"
          alt=""
          decoding="async"
          loading="lazy"
        />
      </div>

      <!-- 埋込型リンクカード - Twitch -->
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

      <!-- 埋込型リンクカード - YouTube -->
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

      <!-- 埋込型リンクカード - Vimeo -->
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

      <!-- 埋込型リンクカードの情報 -->
      <a
        class="external__meta--special"
        :href="external.uri"
        rel="noreferrer"
        target="_blank"
        @click.stop
      >
        <div class="external__meta__title">
          <span>{{ external.title || "" }}</span>
        </div>
        <div class="external__meta__uri">
          <SVGIcon name="link" />
          <span>{{ external.uri }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ external.description || "" }}</span>
        </div>
      </a>
    </div>

    <slot name="after" />
  </div>
</template>

<style lang="scss" scoped>
.external {
  position: relative;

  // 不正なリンクカード
  &--invalid {
    background-color: rgb(var(--fg-color), 0.125);
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    padding: 0.5em 0.75em;
    pointer-events: none;
    user-select: none;
  }

  // 通常のリンクカード
  &--default {
    background-color: rgb(var(--fg-color), 0.125);
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    display: flex;
    overflow: hidden;
    position: relative;

    // 横レイアウト
    &[data-layout="horizontal"] {
      .lazy-image {
        aspect-ratio: 1 / 1;
        object-fit: cover;
        min-width: 6rem;
        max-width: 6rem;
      }
    }

    // 縦レイアウト
    &[data-layout="vertical"] {
      flex-direction: column;

      .lazy-image {
        aspect-ratio: 1.91 / 1;
        object-fit: cover;
        width: 100%;
        min-height: 100%;
      }
    }
  }
  a.external--default {
    cursor: pointer;
  }

  // リンクカードの情報
  &__meta {
    display: grid;
    align-items: center;
    grid-template-rows: auto auto auto;
    padding: 0.75em;
    [data-layout="horizontal"] & {
      grid-template-rows: 1fr auto 1fr;
    }

    &--special {
      display: grid;
      grid-template-rows: auto auto auto;
      margin-top: 0.5em;
    }

    &__title,
    &__uri,
    &__description {
      display: flex;
      align-items: center;
      grid-gap: 0.5em;
      overflow: hidden;

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 0.875em;
      }

      & > span {
        line-height: var(--line-height-high);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__title {
      color: rgb(var(--fg-color));
      font-weight: bold;
    }

    &__uri {
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.75em;
    }

    &__description {
      color: rgb(var(--fg-color), 0.75);
      font-size: 0.875em;
    }
  }

  // 埋込型リンクカード - Apple Music
  &--applemusic {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
  }

  // 埋込型リンクカード - Giphy
  &--giphy {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
  }
  // 埋込型リンクカード - Giphy - SP幅未満
  @include media-sp-layout() {
    &--giphy {
      aspect-ratio: 1 / 1;
      height: unset !important;
    }
  }

  // 埋込型リンクカード - Graysky
  &--graysky {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    width: 100%;
  }

  // 埋込型リンクカード - Nicovideo
  &--nicovideo:deep() {
    iframe[src^="https://embed.nicovideo."] {
      aspect-ratio: 640 / 360;
      background-color: rgb(var(--fg-color), 0.125);
      border-radius: var(--border-radius-middle);
      height: unset !important;
    }
  }

  // 埋込型リンクカード - Spotify
  &--spotify {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: 1rem;
  }

  // 埋込型リンクカード - Tenor
  &--tenor {
    aspect-ratio: 560 / 300;
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  // 埋込型リンクカード - Twitch
  &--twitch {
    aspect-ratio: 1 / 0.6;
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
  }

  // 埋込型リンクカード - YouTube
  &--youtube {
    aspect-ratio: 16 / 9;
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
  }

  // 埋込型リンクカード - Vimeo
  &--vimeo {
    aspect-ratio: 4 / 3;
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
  }
}
</style>
