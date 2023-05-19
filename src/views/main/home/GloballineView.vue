<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { detectAll } from "@/../node_modules/tinyld/dist/tinyld.light.node.js" // TODO: 適切なパスで記述すること
import GloballineSettingsPopup from "@/components/GloballineSettingsPopup.vue"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SubscribeRepos from "@/composables/atp-wrapper/atp-utils/subscribe-repos"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  subscriber?: SubscribeRepos;
  globallineSettingsPopupDisplay: boolean;
}>({
  subscriber: undefined,
  globallineSettingsPopupDisplay: false,
})

onMounted(() => {
  startControlToScroll()
  connect()
})

onBeforeUnmount(() => {
  endControlToScroll()
  disconnect()
})

// subscribeRepo

function connect () {
  const domain = mainState.atp.session?.__service?.replace(/^\w+:\/+/, "") ?? ""
  state.subscriber = new SubscribeRepos(onError, undefined, undefined, onMessage, onPost)
  state.subscriber.connect(`wss://${domain}/xrpc/com.atproto.sync.subscribeRepos`)
  createProfileTimer()
}

function disconnect () {
  state.subscriber?.disconnect()
  destroyProfileTimer()
}

function onError () {
  disconnect()
}

function onMessage () {
  mainState.globallineNumberOfMessages ++
}

async function onPost (did: string, post: any) {
  mainState.globallineNumberOfPosts ++

  messageContainerHeight = (messageContainer.value as any).clientHeight

  // 言語解析
  if (post.record.text != null) {
    const languages = detectAll(post.record.text)
    const yourLanguage = languages.findIndex((language: any) => {
      return language.lang === mainState.currentSetting.globallineLanguage
    }) !== - 1
    if (!yourLanguage) return
  }

  if (mainState.globallineProfiles[did] == null)
    mainState.globallineProfiles[did] = {}
  post.author = mainState.globallineProfiles[did]
  mainState.globallinePosts.unshift(post)
}

function toggleConnect () {
  Util.blurElement()
  if (state.subscriber?.socketState === 0) connect()
  else if (state.subscriber?.socketState === 2) disconnect()
}

// subscribeRepo - プロフィール取得

let timer: undefined | NodeJS.Timer = undefined

function createProfileTimer () {
  timer = setTimeout(async () => {
    // TODO: 適切な場所へ移動すること
    if (state.subscriber?.socket?.readyState === 1)
      mainState.globallineTotalTime ++

    try {
      for (const did in mainState.globallineProfiles) {
        const profile = mainState.globallineProfiles[did]
        if (profile.handle != null) continue
        const newProfile = await mainState.atp.fetchProfile(did)
        for (const key in newProfile) {
          mainState.globallineProfiles[did][key] = newProfile[key]
        }
        break
      }
    } finally {
      createProfileTimer()
    }
  }, 1000)
}

function destroyProfileTimer () {
  clearInterval(timer)
  timer = undefined
}

// 経過時間

function spendTime () {
  const hours = ("00" + Math.floor(mainState.globallineTotalTime / 60 / 60)).slice(- 2)
  const minutes = ("00" + Math.floor(mainState.globallineTotalTime / 60)).slice(- 2)
  const second = ("00" + (mainState.globallineTotalTime % 60)).slice(- 2)
  return `${hours}:${minutes}:${second}`
}

// ポストアクション

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.globallinePosts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post.cid === newPost.cid
    })
    if (newPost != null) mainState.globallinePosts[index] = newPost
  })
}

function removeThisPost (uri: string) {
  mainState.globallinePosts = mainState.globallinePosts
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}

// グローバルライン設定ポップアップ

function openGloballineSettingsPopup () {
  Util.blurElement()
  state.globallineSettingsPopupDisplay = true
}

function closeGloballineSettingsPopup () {
  state.globallineSettingsPopupDisplay = false
}

// スクロール制御

let mutationObserver: undefined | MutationObserver = undefined
const messageContainer = ref(null)
let messageContainerHeight = 0

function startControlToScroll () {
  mutationObserver = new MutationObserver(onMutated)
  mutationObserver.observe((messageContainer.value as unknown as HTMLElement), {
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
  if (scrollTop == 0) return
  const heightDiff = (messageContainer.value as unknown as HTMLElement).clientHeight - messageContainerHeight
  window.scrollTo({
    left: 0,
    top: scrollTop + heightDiff
  })
}
</script>

<template>
  <div class="globalline-view">
    <div
      class="message-container"
      ref="messageContainer"
      >
      <div
        v-for="message of mainState.globallinePosts"
        :key="message.cid"
        class="message-wrapper"
        :data-is-reply="message.record.reply != null"
        :data-is-quote-repost="message.record.embed?.record != null"
        :data-is-loaded="message.author.did != null"
        :data-is-muted="message.author.viewer?.muted"
        :data-is-blocking="message.author.viewer?.blocking != null"
      >
        <!-- ポスト -->
        <Post
          :position="mainState.currentSetting.globallineLayout ?? 'post'"
          :post="message"
          :forceHideImages="true"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />

        <!-- リプライ／引用リポストアイコン -->
        <div
          v-if="message.record.reply != null"
          class="reply-icon"
        >
          <SVGIcon name="post" />
        </div>
        <div
          v-if="message.record.embed?.record != null"
          class="quote-repost-icon"
        >
          <SVGIcon name="quoteRepost" />
        </div>
      </div>
    </div>

    <!-- グローバルラインフッター -->
    <div class="footer">
      <!-- 電源ボタン -->
      <button
        :class="state.subscriber?.socketState === 2 ? 'button--important' : 'button--bordered'"
        class="power-button"
        @click.stop="toggleConnect"
      >
        <template v-if="state.subscriber?.socketState === 0">
          <SVGIcon name="play" />
        </template>
        <template v-else-if="state.subscriber?.socketState === 1">
          <Loader />
        </template>
        <template v-else-if="state.subscriber?.socketState === 2">
          <SVGIcon name="pause" />
        </template>
      </button>

      <!-- 電源ボタン -->
      <div class="info">
        <dl>
          <dt>
            <SVGIcon name="post" />
          </dt>
          <dd>{{ mainState.globallinePosts.length.toLocaleString() }} / {{ mainState.globallineNumberOfPosts.toLocaleString() }} / {{ mainState.globallineNumberOfMessages.toLocaleString() }}</dd>
        </dl>
        <dl>
          <dt>
            <SVGIcon name="clock" />
          </dt>
          <dd>{{ spendTime() }}</dd>
        </dl>
      </div>

      <!-- グローバルライン設定ポップアップトリガー -->
      <button
        class="button--bordered globalline-settings-popup-button"
        @click.stop="openGloballineSettingsPopup"
      >
        <SVGIcon name="setting" />
      </button>
    </div>

    <!-- グローバルライン設定ポップアップ -->
    <GloballineSettingsPopup
      v-if="state.globallineSettingsPopupDisplay"
      @close="closeGloballineSettingsPopup"
    />
  </div>
</template>

<style lang="scss" scoped>
.globalline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.message-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0.5em 0 var(--sp-menu-height);
}

.message-wrapper {
  position: relative;

  &[data-is-loaded="false"] {
    opacity: 0.5;
  }
  &[data-is-muted="true"],
  &[data-is-blocking="true"] {
    display: none;
  }
}

// ポスト
.post {
  padding: 0.5rem 1rem;
}

// リプライ／引用リポストアイコン
.reply-icon,
.quote-repost-icon {
  position: absolute;
  top: 0;
  left: 0.5rem;

  & > .svg-icon {
    font-size: 1.25rem;
    transform: scaleX(- 1.0);
  }
}
.reply-icon {
  & > .svg-icon {
    fill: rgb(var(--post-color));
    stroke: rgb(var(--bg-color));
  }
}
.quote-repost-icon {
  & > .svg-icon {
    fill: rgb(var(--share-color));
    stroke: rgb(var(--bg-color));
  }
}

// グローバルラインフッター
.footer {
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-top: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  grid-gap: 1rem;
  padding: 1rem;
  position: sticky;
  z-index: 1;

  // SP幅以上
  @media (min-width: $sp-width) {
    bottom: 0;
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    bottom: var(--sp-menu-height);
  }

  // 電源ボタン
  .power-button {
    position: relative;
    min-width: 4rem;

    & > .loader {
      font-size: 0.5rem;
    }
  }

  & > .info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    grid-gap: 0.5rem;

    & > dl {
      display: flex;
      align-items: center;
      grid-gap: 0.5rem;
      font-size: 0.875rem;

      & > dt {
        & > .svg-icon {
          fill: rgba(var(--fg-color), 0.5);
        }
      }

      & > dd {
        color: rgba(var(--fg-color), 0.75);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// フローバルライン設定ポップアップ
.globalline-settings-popup-button {
  & > .svg-icon {
    font-size: 1rem;
  }
}
</style>
