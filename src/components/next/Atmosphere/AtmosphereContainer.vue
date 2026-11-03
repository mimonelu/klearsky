<script lang="ts" setup>
import { computed, inject, onMounted, reactive } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

const state = reactive<{
  display: boolean
}>({
  display: true,
})

// 除外する NSID の上位 2 区切り（Bluesky 本体と AT Protocol のコア）
const EXCLUDED_AUTHORITIES = ["app.bsky", "chat.bsky", "com.atproto"]

// ドメインの 1 区切り
const DOMAIN_SEGMENT_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

// TLD（数字のみは不可）
const TLD_REGEX = /^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/

type TTAtmosphereDomain = {
  // NSID の上位 2 区切りを逆順にしたドメイン名
  domain: string

  // そのドメインのコレクション数
  collectionsCount: number
}

// リポジトリのコレクション（NSID）をドメインごとにまとめた一覧
// NOTICE: NSID はアカウントが自由に作れるため、形式に合わないものは除外する
const domains = computed((): Array<TTAtmosphereDomain> => {
  const collections = mainState.currentProfile?.__repo?.collections
  if (!Array.isArray(collections)) {
    return []
  }
  const counts = new Map<string, number>()
  for (const collection of collections) {
    if (typeof collection !== "string") {
      continue
    }
    const segments = collection.toLowerCase().split(".")

    // NSID は 3 区切り以上
    if (segments.length < 3) {
      continue
    }
    const [tld, name] = segments
    if (!TLD_REGEX.test(tld) || !DOMAIN_SEGMENT_REGEX.test(name)) {
      continue
    }
    if (EXCLUDED_AUTHORITIES.includes(`${tld}.${name}`)) {
      continue
    }
    const domain = `${name}.${tld}`
    counts.set(domain, (counts.get(domain) ?? 0) + 1)
  }
  return [...counts]
    .map(([domain, collectionsCount]) => ({ domain, collectionsCount }))
    .sort((a, b) => a.domain.localeCompare(b.domain))
})

onMounted(() => {
  state.display = mainState.currentSetting?.atmosphereDisplay ?? true
})

function toggle () {
  state.display = !state.display
  if (mainState.currentSetting != null) {
    mainState.currentSetting.atmosphereDisplay = state.display
    mainState.saveSettings()
  }
}
</script>

<template>
  <div
    v-if="domains.length > 0"
    class="atmosphere-container"
  >
    <button
      type="button"
      class="button--plain atmosphere-container__button"
      @click.prevent="toggle"
    >
      <SVGIcon name="at" />
      <span translate="no">{{ $t("atmosphere") }}</span>
      <span class="atmosphere-container__count">{{ domains.length }}</span>
      <SVGIcon :name="state.display ? 'cursorUp' : 'cursorDown'" />
    </button>
    <div
      v-if="state.display"
      class="atmosphere-container__content"
    >
      <a
        v-for="item of domains"
        :key="item.domain"
        class="atmosphere-container__item"
        :href="Util.safeExternalUrl(`https://${item.domain}`)"
        rel="noreferrer"
        target="_blank"
        :title="`https://${item.domain}`"
        translate="no"
        @click="onClickExternalLink($event, `https://${item.domain}`)"
      >
        <SVGIcon name="link" />
        <span class="atmosphere-container__domain">{{ item.domain }}</span>
        <span class="atmosphere-container__collections-count">{{ item.collectionsCount }}</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.atmosphere-container {
  background-color: rgb(var(--fg-color), 0.0625);
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;

  &__button {
    margin: 0 -0.5rem;
  }

  &__count {
    color: rgb(var(--fg-color), 0.5);
  }

  &__content {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5rem;
    padding-bottom: 0.5rem;
  }

  // NOTICE: プロフィールリンク（`ProfileLinkList.vue`）と同じ形にする
  &__item {
    --alpha: 0.875;
    background-color: rgb(var(--bg-color));
    border-radius: 1.5em;
    cursor: pointer;
    display: flex;
    align-items: center;
    grid-gap: 0.375em;
    overflow: hidden;
    padding: 0.375em 0.75em;
    max-width: 100%;
    &:focus,
    &:hover {
      --alpha: 1.0;
      background-color: rgb(var(--accent-color), 0.25);
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), var(--alpha));
      min-width: 1em;
    }

    & > span {
      font-size: 0.875em;
      line-height: var(--line-height-low);
      white-space: nowrap;
    }
  }

  &__domain {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__collections-count {
    color: rgb(var(--fg-color), 0.5);
  }
}
</style>
