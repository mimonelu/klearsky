<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import GloballineSettingsPopup from "@/components/popups/GloballineSettingsPopup.vue"
import Loader from "@/components/shells/Loader.vue"
import Post from "@/components/compositions/Post.vue"
import SelectLanguagesPopup from "@/components/popups/SelectLanguagesPopup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import SubscribeRepos from "@/composables/util/subscribe-repos"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  subscriber?: SubscribeRepos
  globallineSettingsPopupDisplay: boolean
  globallineContentLanguagesSettingsPopupDisplay: boolean
}>({
  subscriber: undefined,
  globallineSettingsPopupDisplay: false,
  globallineContentLanguagesSettingsPopupDisplay: false,
})

// 各種最大数
const LIMIT_OF_PROFILES = 1000
const LIMIT_OF_POSTS = 1000
const LIMIT_OF_FETCHING_PROFILES = 10

// プロフィールの取得間隔
const FETCHING_PROFILES_INTERVAL = 1000

onMounted(() => {
  startControlToScroll()
  connect()
})

onBeforeUnmount(() => {
  endControlToScroll()
  disconnect()
  destroyProfileTimer()
})

// subscribeRepo

async function connect () {
  state.subscriber = new SubscribeRepos(onError, undefined, undefined, undefined, onPost)
  let hostName = mainState.atp.session?.__service ?? ""
  const url = Util.safeUrl(hostName)
  if (url == null) {
    console.warn("[klearsky/GloballineView]", hostName)
    return
  }
  hostName = url.hostname
  if (hostName.match(/bsky\.(?:network|social)$/)) {
    hostName = "bsky.network"
  }
  state.subscriber.connect(`wss://${hostName}/xrpc/com.atproto.sync.subscribeRepos`)
  createProfileTimer()
}

function disconnect () {
  state.subscriber?.disconnect()
}

function onError () {
  disconnect()
}

async function onPost (did: string, post: any) {
  mainState.globallineNumberOfPosts ++

  const container = postContainer.value as unknown as HTMLElement
  if (container == null) {
    return
  }
  postContainerHeight = container.clientHeight

  // 言語判定
  const postLanguages = post.record?.langs ?? post.value?.langs
  if (postLanguages == null) {
    // 言語判定 - ポスト言語が設定されていない場合はスキップ
    if (mainState.currentSetting.globallineSkipPostHasNoLanguage) {
      return
    }
  } else {
    // 言語判定 - グローバルフィード用コンテンツ言語が設定されている＆ポスト言語をひとつでも含んでいる場合
    if (mainState.currentSetting.globallineContentLanguages?.length) {
      const hasContentLanguages = mainState.currentSetting.globallineContentLanguages
        ?.some((contentLanguage: string) => {
          return postLanguages.includes(contentLanguage)
        })
      if (!hasContentLanguages) {
        return
      }
    }
  }

  // グローバルフィードのポストの種別フィルタリング
  if (mainState.currentSetting.globallinePostTypes != null) {
    const wantsPost = mainState.currentSetting.globallinePostTypes.includes("post")
    const wantsReply = mainState.currentSetting.globallinePostTypes.includes("reply")
    const wantsQuoteRepost = mainState.currentSetting.globallinePostTypes.includes("quoteRepost")
    const isPost = post.record.reply == null && post.record.embed?.record == null
    const isReply = post.record.reply != null
    const isQuoteRepost = post.record.embed?.record != null
    if ((isPost && !wantsPost) ||
        (isReply && !wantsReply) ||
        (isQuoteRepost && !wantsQuoteRepost)) {
      return
    }
  }

  // グローバルフィードプロフィールの設定
  if (mainState.globallineProfiles[did] == null) {
    mainState.globallineProfiles[did] = {}

    // グローバルフィードプロフィールの最大数制限
    const profileKeys = Object.keys(mainState.globallineProfiles)
    if (profileKeys.length > LIMIT_OF_PROFILES) {
      profileKeys
        .splice(0, LIMIT_OF_PROFILES)
        .forEach((profileKey: string) => {
          delete mainState.globallineProfiles[profileKey]
        })
    }
  }
  post.author = mainState.globallineProfiles[did]

  // グローバルフィードポストの追加
  mainState.globallinePosts.unshift(post)

  // グローバルフィードポストの最大数制限
  mainState.globallinePosts.splice(LIMIT_OF_POSTS)
}

function toggleConnect () {
  Util.blurElement()
  if (state.subscriber?.socketState === 0) {
    connect()
  } else if (state.subscriber?.socketState === 2) {
    disconnect()
  }

  // 停止ライン
  if (mainState.globallinePosts[0] != null &&
      mainState.globallinePosts[0].__isLatestPost == null) {
    mainState.globallinePosts[0].__isLatestPost = true
  }
}

// グローバルフィードプロフィールの取得

let timer: undefined | NodeJS.Timeout = undefined

function createProfileTimer () {
  timer = setTimeout(async () => {
    // 取得対象のプロフィール
    const targetProfiles: any[] = []
    for (const did in mainState.globallineProfiles) {
      const profile = mainState.globallineProfiles[did]

      // DID を取得待ちかどうかの判定に利用
      if (profile.did != null) {
        continue
      }
      profile.did = did

      // 一度に取得する最大プロフィール数の超過判定
      targetProfiles.push(profile)
      if (targetProfiles.length >= LIMIT_OF_FETCHING_PROFILES) {
        break
      }
    }

    // グローバルフィードプロフィールの取得
    if (targetProfiles.length > 0) {
      const dids = targetProfiles.map((targetProfile: any) => {
        return targetProfile.did
      })
      const newProfiles = await mainState.atp.fetchProfiles(dids)
      if (!(newProfiles instanceof Error)) {
        for (const newProfile of newProfiles) {
          if (mainState.globallineProfiles[newProfile.did] != null) {
            Object.assign(mainState.globallineProfiles[newProfile.did], newProfile)
          }
        }
      }
    }

    createProfileTimer()
  }, FETCHING_PROFILES_INTERVAL)
}

function destroyProfileTimer () {
  clearInterval(timer)
  timer = undefined
}

function isPostVisible (post: TTPost): boolean {
  const followersCountThresholdString = mainState.currentSetting.globallineFollowersCountThreshold
  if (followersCountThresholdString == null || followersCountThresholdString === "") {
    return true
  }
  const followersCountThreshold = Number(followersCountThresholdString)
  const authorFollowersCount = post.author?.followersCount as undefined | number
  return followersCountThreshold === 0
    ? (authorFollowersCount ?? - 1) === followersCountThreshold
    : followersCountThreshold > 0
      ? (authorFollowersCount ?? 0) >= followersCountThreshold
      : (authorFollowersCount ?? Number.MAX_SAFE_INTEGER) <= Math.abs(followersCountThreshold)
}

// ポストアクション

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.globallinePosts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post.uri === newPost.uri
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.globallinePosts[index], newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.globallinePosts = mainState.globallinePosts
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}

// グローバルフィード用コンテンツ言語設定ポップアップ

function openGloballineContentLanguagesSettingsPopup () {
  Util.blurElement()
  state.globallineContentLanguagesSettingsPopupDisplay = true
}

function closeGloballineContentLanguagesSettingsPopup () {
  state.globallineContentLanguagesSettingsPopupDisplay = false
}

// グローバルフィード設定ポップアップ

function openGloballineSettingsPopup () {
  Util.blurElement()
  state.globallineSettingsPopupDisplay = true
}

function closeGloballineSettingsPopup () {
  state.globallineSettingsPopupDisplay = false
}

// スクロール制御

let mutationObserver: undefined | MutationObserver = undefined
const postContainer = ref(null)
let postContainerHeight = 0

function startControlToScroll () {
  const container = postContainer.value as unknown as HTMLElement
  if (container == null) {
    return
  }
  mutationObserver = new MutationObserver(onMutated)
  mutationObserver.observe(container, {
    childList: true,
    characterData: false,
    characterDataOldValue: false,
    attributes: true,
    subtree: false,
  })
}

function endControlToScroll () {
  mutationObserver?.disconnect()
}

function onMutated () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  if (scrollTop == 0) {
    return
  }
  const container = postContainer.value as unknown as HTMLElement
  if (container == null) {
    return
  }
  const heightDiff = container.clientHeight - postContainerHeight
  window.scrollTo({
    left: 0,
    top: scrollTop + heightDiff
  })
}
</script>

<template>
  <div class="globalline-view">
    <!-- グローバルフィードヘッダー -->
    <Portal to="home-view-header-bottom">
      <div class="globalline-view__header">
        <!-- 情報 -->
        <div class="info">
          <dl>
            <dt>
              <SVGIcon name="post" />
            </dt>
            <dd>{{ mainState.globallinePosts.length.toLocaleString() }} / {{ mainState.globallineNumberOfPosts.toLocaleString() }}</dd>
          </dl>
        </div>

        <!-- 電源ボタン -->
        <button
          class="button--bordered power-button"
          :data-is-on="state.subscriber?.socketState === 2"
          @click.stop="toggleConnect"
        >
          <template v-if="state.subscriber?.socketState === 0">
            <SVGIcon name="play" />
          </template>
          <template v-else-if="state.subscriber?.socketState === 1">
            <SVGIcon name="menu" />
            <Loader />
          </template>
          <template v-else-if="state.subscriber?.socketState === 2">
            <SVGIcon name="pause" />
          </template>
        </button>

        <!-- グローバルフィード用コンテンツ言語設定ポップアップトリガー -->
        <button
          class="button--bordered globalline-content-languages-settings-popup-button"
          @click.stop="openGloballineContentLanguagesSettingsPopup"
        >
          <SVGIcon name="translate" />
        </button>

        <!-- グローバルフィード設定ポップアップトリガー -->
        <button
          class="button--bordered globalline-settings-popup-button"
          @click.stop="openGloballineSettingsPopup"
        >
          <SVGIcon name="setting" />
        </button>
      </div>
    </Portal>

    <!-- タイムライン -->
    <div
      class="post-container"
      ref="postContainer"
      >
      <div
        v-for="post of mainState.globallinePosts"
        :key="post.uri"
        class="post-wrapper"
        :data-is-reply="post.record.reply != null"
        :data-is-quote-repost="post.record.embed?.record != null"
        :data-is-loaded="post.author.did != null"
        :data-is-muted="post.author.viewer?.muted"
        :data-is-blocking="post.author.viewer?.blocking != null"
        :data-is-latest="post.__isLatestPost"
      >
        <!-- ポスト -->
        <Post
          v-if="isPostVisible(post)"
          :position="mainState.currentSetting.globallineLayout ?? 'post'"
          :post="post"
          :hasReplyIcon="post.record.reply != null"
          :hasQuoteRepostIcon="post.record.embed?.record != null"
          :forceHideMedia="true"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
      </div>
    </div>

    <!-- グローバルフィード用コンテンツ言語設定ポップアップ -->
    <Transition>
      <SelectLanguagesPopup
        v-if="state.globallineContentLanguagesSettingsPopupDisplay"
        :state="mainState.currentSetting"
        property="globallineContentLanguages"
        title="globallineContentLanguages"
        :hasHelpButton="false"
        @close="closeGloballineContentLanguagesSettingsPopup"
        @change="mainState.saveSettings"
      />
    </Transition>

    <!-- グローバルフィード設定ポップアップ -->
    <Transition>
      <GloballineSettingsPopup
        v-if="state.globallineSettingsPopupDisplay"
        @close="closeGloballineSettingsPopup"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.globalline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  // グローバルフィードヘッダー
  &__header {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    padding: 0 0.5rem 0 0.5rem;
    min-height: 3rem;
  }
}

.post-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0.5em 0 var(--sp-menu-height);
}

.post-wrapper {
  position: relative;

  &[data-is-loaded="false"] {
    opacity: 0.5;
  }
  &[data-is-muted="true"],
  &[data-is-blocking="true"] {
    display: none;
  }

  // 停止ライン
  &:not(:first-child)[data-is-latest="true"] {
    border-top: 0.5em solid rgb(var(--fg-color), 0.125);
    margin-top: 1px;
  }
}

// ポスト
.post {
  padding: 0.5rem 1rem;
}

// 情報
.info {
  display: flex;
  flex-grow: 1;
  align-content: center;
  justify-content: flex-end;
  grid-gap: 0.5rem;

  & > dl {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;

    & > dt {
      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 0.875rem;
      }
    }

    & > dd {
      color: rgb(var(--fg-color), 0.75);
      font-family: monospace;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 電源ボタン
.power-button {
  position: relative;

  & > .svg-icon--menu {
    visibility: hidden;
  }

  & > .loader {
    font-size: 0.5rem;
  }

  &[data-is-on="true"] {
    & > .svg-icon {
      fill: rgb(var(--notice-color), 0.75);
    }
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}
</style>
@/composables/util/subscribe-repos