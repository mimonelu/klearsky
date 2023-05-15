<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted } from "vue"
import Post from "@/components/Post.vue"

// レコード解析用
import { addExtension, decode, decodeMultiple } from "cbor-x"
import { CarBufferReader } from "@ipld/car"
import { CID } from "multiformats"

// 言語解析用
import { detectAll } from "@/../node_modules/tinyld/dist/tinyld.light.node.js" // TODO: 適切なパスで記述すること

const mainState = inject("state") as MainState

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

onMounted(() => {
  const domain = mainState.atp.session?.__service?.replace(/^\w+:\/+/, "") ?? ""
  socket = new WebSocket(`wss://${domain}/xrpc/com.atproto.sync.subscribeRepos`)
  socket.addEventListener("message", onMessage)

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
})

onBeforeUnmount(() => {
  socket?.removeEventListener("message", onMessage)
  socket?.close()

  clearInterval(timer)
  timer = undefined
})

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

  const cid = body.commit.toString()
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
  })
}

function socketState () {
  return socket?.readyState ?? 0
}

function spendTime () {
  const hours = ("00" + Math.floor(mainState.globallineTotalTime / 60 / 60)).slice(- 2)
  const minutes = ("00" + Math.floor(mainState.globallineTotalTime / 60)).slice(- 2)
  const second = ("00" + (mainState.globallineTotalTime % 60)).slice(- 2)
  return `${hours}:${minutes}:${second}`
}
</script>

<template>
  <div class="globalline-view">
    <div class="message-container">
      <div
        v-for="message, index of mainState.globallinePosts"
        :key="index"
        class="message-wrapper"
      >
        <Post
          position="post"
          :post="message"
        />
      </div>
    </div>
    <div class="footer">
      <div class="controls">
        <div>{{ socketState() }}</div>
        <div>Posts: {{ mainState.globallinePosts.length }} / {{ mainState.globallineNumberOfPosts }} / {{ mainState.globallineNumberOfMessages }}</div>
        <div>Time: {{ spendTime() }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-top: 1px solid rgba(var(--fg-color), 0.25);
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
}

.controls {
  display: flex;
  align-items: center;
  grid-gap: 1rem;

  & > * {
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.message-container {
  display: flex;
  flex-direction: column;
  padding: 0.5em 0;
}

.message-wrapper {
  display: contents;
}

.post {
  padding: 0.5em 1em;
}
</style>
