<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

// レコード解析用
import { addExtension, decode, decodeMultiple } from "cbor-x"
import { CarBufferReader } from "@ipld/car"
import { CID } from "multiformats"

// 言語解析用
import { detectAll } from "@/../node_modules/tinyld/dist/tinyld.light.node.js" // TODO: 適切なパスで記述すること

const mainState = inject("state") as MainState

const state = reactive<{
  socketState?: number;
}>({
  socketState: 0,
})

let socket: undefined | WebSocket = undefined

let timer: undefined | NodeJS.Timer = undefined

// レコード解析用処理
addExtension({
  Class: CID,
  tag: 42,
  encode () {
    throw new Error("Cannot encode cids")
  },
  decode (bytes: Uint8Array) {
    if (bytes[0] !== 0) throw new Error("Invalid cid")
    return CID.decode(bytes.subarray(1))
  },
})

onMounted(connect)

onBeforeUnmount(disconnect)

function connect () {
  const domain = mainState.atp.session?.__service?.replace(/^\w+:\/+/, "") ?? ""
  socket = new WebSocket(`wss://${domain}/xrpc/com.atproto.sync.subscribeRepos`)
  socket.addEventListener("open", onOpen)
  socket.addEventListener("close", onClose)
  socket.addEventListener("message", onMessage)
  state.socketState = 1

  timer = setInterval(async () => {
    if (socket?.readyState === 1) mainState.globallineTotalTime ++

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
  socket?.removeEventListener("message", onOpen)
  socket?.removeEventListener("message", onMessage)
  socket?.close()

  clearInterval(timer)
  timer = undefined
}

function onOpen () {
  state.socketState = 2
}

function onClose () {
  state.socketState = 0
}

async function onMessage (messageEvent: MessageEvent) {
  mainState.globallineNumberOfMessages ++
  if (!(messageEvent.data instanceof Blob)) return
  const arrayBuffer = await messageEvent.data.arrayBuffer()
  const uint8Array: Uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
  const data = decodeMultiple(uint8Array) as Array<any>
  const header = data[0]
  if (header?.op !== 1) {
    console.warn("[klearsky/subscribeRepos]", "header?.op !== 1", data)
    return
  }
  const body = data[1]
  if (body?.blocks == null) return
  const car = CarBufferReader.fromBytes(body.blocks)

  let cid = undefined
  const did = body.repo
  let rkey = undefined
  let record = undefined
  for (const op of body.ops) {
    // 何らかのレコードが削除された
    if (!op.cid) continue
    const block = car.get(op.cid)
    if (!block) continue
    const currentRecord = decode(block.bytes)
    if (currentRecord == null) continue
    // ポスト・引用リポスト・リプライのみ処理
    if (typeof currentRecord.$type === "string" &&
        currentRecord.$type !== "app.bsky.feed.post") return
    cid = op.cid.toString()
    rkey = op.path.split("/").at(- 1)
    record = currentRecord
  }
  if (record == null) return

  mainState.globallineNumberOfPosts ++

  // 言語解析
  if (record.text != null) {
    const languages = detectAll(record.text)
    const yourLanguage = languages.findIndex((language: any) => {
      // TODO: 言語を選択できるようにすること
      return language.lang === window.navigator.language
    }) !== - 1
    if (!yourLanguage) return
  }

  if (mainState.globallineProfiles[did] == null) mainState.globallineProfiles[did] = {}

  mainState.globallinePosts.unshift({
    uri: `at://${did ?? ''}/app.bsky.feed.post/${rkey ?? ''}`,
    cid,
    author: mainState.globallineProfiles[did] as TTUser,
    record,
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,
    indexedAt: record.createdAt,
    viewer: {},
    __createdAt: record.createdAt,
    embed: record.embed,
  })
}

function toggleConnect () {
  Util.blurElement()
  if (state.socketState === 0) {
    connect()
  } else if (state.socketState === 2) {
    disconnect()
  }
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
  mainState.globallinePosts = mainState.globallinePosts.filter((post: TTPost) => {
    return post.uri !== uri
  })
}
</script>

<template>
  <div class="globalline-view">
    <div class="message-container">
      <div
        v-for="message of mainState.globallinePosts"
        :key="message.cid"
        class="message-wrapper"
        :data-is-reply="message.record.reply != null"
        :data-is-quote-repost="message.record.embed?.record != null"
        :data-is-loaded="message.author.did != null"
        :data-is-blocking="message.author.viewer?.blocking != null"
      >
        <Post
          position="post"
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
        :class="state.socketState === 2 ? 'button--important' : 'button--bordered'"
        class="power-button"
        @click.stop="toggleConnect"
      >
        <template v-if="state.socketState === 0">
          <SVGIcon name="play" />
        </template>
        <template v-else-if="state.socketState === 1">
          <Loader />
        </template>
        <template v-else-if="state.socketState === 2">
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
    </div>
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
</style>
