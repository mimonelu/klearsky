<script lang="ts" setup>
import { computed, inject, onMounted, reactive, watch } from "vue"
import AvatarThumbnail from "@/components/next/Avatar/AvatarThumbnail.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

const state = reactive<{
  display: boolean
}>({
  display: true,
})

// `getProfiles` の 1 回あたりの最大件数
const PROFILES_PER_REQUEST = 25

// `getProfiles` の最大回数
const MAX_PROFILES_REQUESTS = 5

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

// ドメインをハンドルとするアカウント
const accounts = reactive(new Map<string, TTUser>())

// アカウントの取得を要求済みのドメイン
const requestedDomains = new Set<string>()

let numberOfProfilesRequests = 0

// 開いている時だけ、未取得のドメインのアカウントを取得する。表示はブロックしない
// NOTICE: 別のプロフィールに移ると `key` によりコンポーネントごと作り直されるため、古いレスポンスは破棄されたインスタンスに入るだけになる
function fetchAccounts () {
  if (!state.display) {
    return
  }
  const targets = domains.value
    .map((item) => item.domain)
    .filter((domain) => !requestedDomains.has(domain))
  for (
    let index = 0;
    index < targets.length && numberOfProfilesRequests < MAX_PROFILES_REQUESTS;
    index += PROFILES_PER_REQUEST
  ) {
    const actors = targets.slice(index, index + PROFILES_PER_REQUEST)
    actors.forEach((domain) => requestedDomains.add(domain))
    numberOfProfilesRequests ++
    fetchAccountsOf(actors)
  }
}

async function fetchAccountsOf (actors: Array<string>) {
  const profiles = await mainState.atp.fetchProfiles(actors)
  if (profiles instanceof Error) {
    return
  }
  for (const profile of profiles) {
    // ハンドルの検証に失敗したアカウントなど、ドメインと一致しないものは使わない
    const domain = profile.handle.toLowerCase()
    if (!actors.includes(domain)) {
      continue
    }
    accounts.set(domain, profile)
  }
}

// リンク先とアイコンに使うアカウント。アバターのないアカウントは使わない
// NOTICE: アバターの有無でリンク先（プロフィールかドメインか）を見分けられるようにするため
// NOTICE: ラベル設定で非表示またはぼかし対象のアカウントと、ブロック関係にあるアカウントは使わない
const accountsForLink = computed((): Map<string, TTUser> => {
  const results = new Map<string, TTUser>()
  for (const [domain, account] of accounts) {
    if (
      account.avatar == null ||
      account.viewer?.blocking ||
      account.viewer?.blockedBy ||
      hasUserBlurLabel(mainState, account.labels)
    ) {
      continue
    }
    results.set(domain, account)
  }
  return results
})

watch([() => state.display, domains], fetchAccounts)

onMounted(() => {
  state.display = mainState.currentSetting?.atmosphereDisplay ?? true
  fetchAccounts()
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
      <template
        v-for="item of domains"
        :key="item.domain"
      >
        <!-- アカウントがあればプロフィールへのリンク -->
        <RouterLink
          v-if="accountsForLink.has(item.domain)"
          class="atmosphere-container__item"
          :to="{ name: 'profile-feeds', query: { account: accountsForLink.get(item.domain)?.did } }"
          :title="accountsForLink.get(item.domain)?.displayName || item.domain"
          translate="no"
        >
          <AvatarThumbnail
            :image="accountsForLink.get(item.domain)?.avatar"
            :isLabeler="accountsForLink.get(item.domain)?.associated?.labeler"
          />
          <span class="atmosphere-container__domain">{{ item.domain }}</span>
          <span class="atmosphere-container__collections-count">{{ item.collectionsCount }}</span>
        </RouterLink>

        <!-- アカウントがなければドメインへのリンク -->
        <a
          v-else
          class="atmosphere-container__item atmosphere-container__item--domain"
          :href="Util.safeExternalUrl(`https://${item.domain}`)"
          rel="noreferrer"
          target="_blank"
          :title="`https://${item.domain}`"
          translate="no"
          @click="onClickExternalLink($event, `https://${item.domain}`)"
        >
          <SVGIcon name="point" />
          <span class="atmosphere-container__domain">{{ item.domain }}</span>
          <span class="atmosphere-container__collections-count">{{ item.collectionsCount }}</span>
        </a>
      </template>
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

  // NOTICE: プロフィールリンク（`ProfileLinkList.vue`）に準じた形にする
  &__item {
    background-color: rgb(var(--bg-color));
    border-radius: 1.5em;
    cursor: pointer;
    display: flex;
    align-items: center;
    grid-gap: 0.375em;
    overflow: hidden;
    padding: 0.375em 0.75em 0.375em 0.375em;
    max-width: 100%;
    &:focus,
    &:hover {
      background-color: rgb(var(--accent-color), 0.25);
    }

    & > .svg-icon {
      font-size: 1.5em;
      fill: rgb(var(--fg-color), 0.25);
      min-width: 1em;
    }

    // NOTICE: アバター自体のホバー表現（角が四角くなる）を出さないため、ポインターイベントを無効にする
    & > .avatar-thumbnail {
      font-size: 1.5em;
      min-width: 1em;
      pointer-events: none;
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

  // ドメインへのリンク（アカウントがない場合）
  &__item--domain &__domain {
    color: rgb(var(--fg-color), 0.5);
  }

  &__collections-count {
    color: rgb(var(--fg-color), 0.5);
  }
}
</style>
