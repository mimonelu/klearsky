<script lang="ts" setup>
import { computed, inject, ref } from "vue"
import { useRouter } from "vue-router"
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

const embeddedType = computed((): string => {
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
})

let isInvalidUrl = false
let embeddedContentType: null | string = null
let embeddedContentId: null | string = null
const klearskyHostname = window.location.hostname
let SoptifyType: string = "album"

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

  // 埋込型リンクカード - Nicovideo
  else if (url.hostname === "www.nicovideo.jp") {
    const matches = url.pathname.match(/\/watch\/([^/]+)/)
    if (matches != null && matches[1] != null) {
      embeddedContentType = "nicovideo"
      embeddedContentId = matches[1]
      return
    }
  }

  // 埋込型リンクカード - Spotify
  else if (url.hostname === "open.spotify.com") {
    const matches = url.pathname.match(/\/(album|artist|track)\/([^/]+)/)
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
    const matches = url.pathname.match(/^\/([^/]+)/)
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

getEmbeddedContentId()

// 通常のリンクカード - URL検索ボタン

const router = useRouter()

function searchUrl () {
  router.push({
    name: "post-search",
    query: { text: props.external.uri }
  })
}
</script>

<template>
  <div
    class="external"
    :data-layout="layout"
  >
    <!-- 不正な URL -->
    <div
      v-if="isInvalidUrl"
      class="external--invalid textlabel"
    >
      <div class="textlabel__text--alert">
        <SVGIcon name="alert" />{{ $t("invalidUrlError") }} ({{ external.uri }})
      </div>
    </div>

    <!-- 通常のリンクカード -->
    <Component
      v-else-if="embeddedType === ''"
      :is="noLink ? 'div' : 'a'"
      class="external--default"
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

      <!-- 通常のリンクカード - 各種情報 -->
      <div class="external__meta">
        <div class="external__meta__title">
          <span>{{ external.title || external.uri }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ external.description || "&emsp;" }}</span>
        </div>
        <div class="external__meta__uri">
          <SVGIcon name="link" />
          <span>{{ external.uri }}</span>
        </div>
      </div>

      <!-- 通常のリンクカード - URL検索ボタン -->
      <button
        v-if="!noLink"
        class="external__search-button"
        @click.prevent="searchUrl"
      >
        <SVGIcon name="search" />
      </button>
    </Component>

    <!-- 埋込型リンクカード -->
    <div
      v-else
      class="external--embedded"
    >
      <!-- 埋込型リンクカード - Apple Music -->
      <iframe
        v-if="embeddedType === 'applemusic'"
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
        v-if="embeddedType === 'giphy'"
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
        v-if="embeddedType === 'graysky'"
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
      <iframe
        v-else-if="embeddedType === 'nicovideo'"
        class="external--nicovideo"
        :src="`https://ext.nicovideo.jp/thumb/${embeddedContentId}`"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        frameborder="0"
        loading="lazy"
        scrolling="no"
        width="100%"
        height="176"
      />

      <!-- 埋込型リンクカード - Spotify -->
      <iframe
        v-else-if="embeddedType === 'spotify'"
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
        v-else-if="embeddedType === 'tenor'"
        class="external--tenor"
      >
        <img
          :src="embeddedContentId as unknown as string"
          alt=""
          decoding="async"
          loading="lazy"
        />
      </div>

      <!-- 埋込型リンクカード - Twitch -->
      <iframe
        v-else-if="embeddedType === 'twitch'"
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
        v-else-if="embeddedType === 'youtube'"
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
        v-else-if="embeddedType === 'vimeo'"
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
        class="external__meta"
        :href="external.uri"
        rel="noreferrer"
        target="_blank"
        @click.stop
      >
        <div class="external__meta__title">
          <span>{{ external.title || "" }}</span>
        </div>
        <div class="external__meta__description">
          <span>{{ external.description || "" }}</span>
        </div>
        <div class="external__meta__uri">
          <SVGIcon name="link" />
          <span>{{ external.uri }}</span>
        </div>
      </a>
    </div>

    <!-- 埋込型リンクカード - URL検索ボタン -->
    <button
      v-if="!noLink && !isInvalidUrl"
      class="external__search-button"
      @click.prevent.stop="searchUrl"
    >
      <SVGIcon name="search" />
    </button>

    <slot name="after" />
  </div>
</template>

<style lang="scss" scoped>
.external {
  --size: 6rem;
  position: relative;

  // 不正な URL
  &--invalid {
    background-color: rgb(var(--fg-color), 0.125);
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    padding: 0.5em 0.75em;
    pointer-events: none;
    user-select: none;
    word-break: break-all;
  }

  // 横レイアウト
  &[data-layout="horizontal"] {
    .external--default .lazy-image {
      aspect-ratio: 1 / 1;
      object-fit: cover;
      min-width: var(--size);
      max-width: var(--size);
    }

    .external__meta__title,
    .external__meta__description {
      & > span {
        white-space: nowrap;
      }
    }
  }

  // 縦レイアウト
  &[data-layout="vertical"] {
    .external--default {
      flex-direction: column;

      .lazy-image {
        aspect-ratio: 1.91 / 1;
        object-fit: cover;
        width: 100%;
        min-height: 100%;
      }
    }
  }

  &:not([data-layout="horizontal"]) {
    .external__meta__title > span,
    .external__meta__description > span {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    .external__meta__title > span {
      line-clamp: 3;
      -webkit-line-clamp: 3;
    }
    .external__meta__description > span {
      line-clamp: 2;
      -webkit-line-clamp: 2;
    }
  }

  // 通常のリンクカード
  &--default {
    background-color: rgb(var(--fg-color), 0.125);
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    display: flex;
    overflow: hidden;
    position: relative;
  }
  a.external--default {
    cursor: pointer;
  }

  // 通常のリンクカード - 各種情報
  &__meta {
    display: grid;
    flex-grow: 1;
    align-items: center;
    grid-template-rows: auto auto auto;
    padding: 0.5em 0.75em;
    min-height: var(--size);
    [data-layout="horizontal"] & {
      grid-template-rows: 1fr auto 1fr;
    }

    &__title,
    &__description,
    &__uri {
      display: flex;
      align-items: center;
      grid-gap: 0.5em;
      overflow: hidden;

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 0.875em;
      }

      & > span {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &__title {
      color: rgb(var(--fg-color));
      font-weight: bold;

      & > span {
        line-height: var(--line-height-high);
      }
    }

    &__description {
      color: rgb(var(--fg-color), 0.75);
      font-size: 0.875em;

      & > span {
        line-height: var(--line-height-high);
      }
    }

    &__uri {
      border-top: 1px solid rgb(var(--fg-color), 0.125);
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.75em;
      margin-top: 0.25em;
      margin-right: 2.5em;
      padding-top: 0.5em;
      width: calc(100% - 2.5em);

      & > span {
        line-height: var(--line-height-low);
        white-space: nowrap;
      }
    }
  }

  // 通常のリンクカード - URL検索ボタン
  &__search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 2.5em;
    height: 2.5em;
    &:focus, &:hover {
      cursor: pointer;

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
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
  &--nicovideo {
    aspect-ratio: 565 / 176;
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
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
