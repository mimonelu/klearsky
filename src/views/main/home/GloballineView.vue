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

let timer: undefined | NodeJS.Timer = undefined

onMounted(() => {
  startControlToScroll()
  connect()
})

onBeforeUnmount(() => {
  endControlToScroll()
  disconnect()
})

function connect () {
  const domain = mainState.atp.session?.__service?.replace(/^\w+:\/+/, "") ?? ""
  state.subscriber = new SubscribeRepos(onError, undefined, undefined, onMessage, onPost)
  state.subscriber.connect(`wss://${domain}/xrpc/com.atproto.sync.subscribeRepos`)

  timer = setInterval(async () => {
    if (state.subscriber?.socket?.readyState === 1)
      mainState.globallineTotalTime ++

    for (const did in mainState.globallineProfiles) {
      const profile = mainState.globallineProfiles[did]
      if (profile.handle != null) continue
      const newProfile = await mainState.atp.fetchProfile(did)
      for (const key in newProfile) {
        mainState.globallineProfiles[did][key] = newProfile[key]
      }
      return
    }
  }, 1000)
}

function disconnect () {
  state.subscriber?.disconnect()

  clearInterval(timer)
  timer = undefined
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
      return language.lang === mainState.globallineLanguage
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

function spendTime () {
  const hours = ("00" + Math.floor(mainState.globallineTotalTime / 60 / 60)).slice(- 2)
  const minutes = ("00" + Math.floor(mainState.globallineTotalTime / 60)).slice(- 2)
  const second = ("00" + (mainState.globallineTotalTime % 60)).slice(- 2)
  return `${hours}:${minutes}:${second}`
}

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
        <Post
          :position="mainState.globallineLayout"
          :post="message"
          :forceHideImages="true"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
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
    <div class="footer">
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
      <button
        class="button--bordered globalline-settings-popup-button"
        @click.stop="openGloballineSettingsPopup"
      >
        <SVGIcon name="setting" />
      </button>
    </div>
    <GloballineSettingsPopup
      v-if="state.globallineSettingsPopupDisplay"
      @close="closeGloballineSettingsPopup"
    />
  </div>
</template>

<style lang="scss" scoped>
.globalline-view {
  padding-bottom: var(--sp-menu-height);
}

.message-container {
  display: flex;
  flex-direction: column;
  padding: 0.5em 0;
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

.post {
  padding: 0.5rem 1rem;
}

.footer {
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-top: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  grid-gap: 1rem;
  padding: 1rem;
  position: fixed;
  width: calc($router-view-width - 2px);
  z-index: 1;

  // SP幅以上
  @media (min-width: $sp-width) {
    bottom: 0;
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    bottom: var(--sp-menu-height);
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

.power-button {
  position: relative;
  min-width: 4rem;

  & > .loader {
    font-size: 0.5rem;
  }
}

.globalline-settings-popup-button {
  & > .svg-icon {
    font-size: 1rem;
  }
}
</style>
