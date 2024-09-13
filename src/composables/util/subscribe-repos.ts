import { addExtension, decode, decodeMultiple } from "cbor-x/decode"
import { CarBufferReader } from "@ipld/car/buffer-reader"
import { CID } from "multiformats/cid"
import Util from "@/composables/util"

addExtension({
  Class: CID,
  tag: 42,
  encode () {
    throw Error("cidEncodeError")
  },
  decode (bytes: Uint8Array) {
    if (bytes[0] !== 0) {
      throw Error("invalidCidError")
    }
    return CID.decode(bytes.subarray(1))
  },
})

export default class {
  socket?: WebSocket
  socketState: number
  errorListener: (this: WebSocket, event: Event) => any
  openListener: (this: WebSocket, event: Event) => any
  closeListener: (this: WebSocket, event: Event) => any
  messageListener: (messageEvent: MessageEvent<any>) => Promise<void>
  errorCallback?: (event: Event) => void
  openCallback?: () => void
  closeCallback?: () => void
  messageCallback?: () => void
  postCallback?: (did: string, post: TTPost) => void

  constructor (
    onError?: (event: Event) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onMessage?: () => void,
    onPost?: (did: string, post: TTPost) => void
  ) {
    this.socket = undefined
    this.socketState = 0
    this.errorListener = this.onError.bind(this)
    this.openListener = this.onOpen.bind(this)
    this.closeListener = this.onClose.bind(this)
    this.messageListener = this.onMessage.bind(this)
    this.errorCallback = onError
    this.openCallback = onOpen
    this.closeCallback = onClose
    this.messageCallback = onMessage
    this.postCallback = onPost
  }

  connect (url: string) {
    this.socket = new WebSocket(url)
    this.socketState = 1
    this.socket.addEventListener("error", this.errorListener)
    this.socket.addEventListener("open", this.openListener)
    this.socket.addEventListener("close", this.closeListener)
    this.socket.addEventListener("message", this.messageListener)
  }

  disconnect () {
    this.socket?.removeEventListener("error", this.errorListener)
    this.socket?.removeEventListener("open", this.openListener)
    this.socket?.removeEventListener("close", this.closeListener)
    this.socket?.removeEventListener("message", this.messageListener)
    this.socket?.close()
    this.socketState = 0
  }

  onError (event: Event) {
    console.warn("[klearsky/subscribeRepos]", event)
    if (this.errorCallback != null) {
      this.errorCallback(event)
    }
  }

  onOpen () {
    this.socketState = 2
    if (this.openCallback != null) {
      this.openCallback()
    }
  }

  onClose () {
    if (this.closeCallback != null) {
      this.closeCallback()
    }
  }

  async onMessage (messageEvent: MessageEvent) {
    if (!(messageEvent.data instanceof Blob)) {
      return
    }
    const arrayBuffer = await messageEvent.data.arrayBuffer()
    const uint8Array: Uint8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
    const data = decodeMultiple(uint8Array) as Array<any>
    const header = data[0]
    if (header?.op !== 1) {
      console.warn("[klearsky/subscribeRepos]", "header?.op !== 1", data)
      return
    }
    const body = data[1]
    if (body?.blocks == null) {
      // 例： `{t: '#handle', op: 1}`: 新規ユーザー
      console.warn("[klearsky/subscribeRepos]", "body?.blocks == null", data)
      return
    }
    let car

    // Unexpected end of data 対策
    try {
      car = CarBufferReader.fromBytes(body.blocks)
    } catch (error: any) {
      console.warn("[klearsky/CarBufferReader.fromBytes]", error)
    }

    if (this.messageCallback != null) {
      this.messageCallback()
    }

    let cid = undefined
    const did = body.repo
    let rkey = undefined
    let record = undefined
    for (const op of body.ops) {
      // 何らかのレコードが削除された
      if (!op.cid) {
        continue
      }
      const block = car?.get(op.cid)
      if (!block) {
        continue
      }
      const currentRecord = decode(block.bytes)
      if (currentRecord == null) {
        continue
      }
      // ポスト・引用リポスト・リプライのみ処理
      if (typeof currentRecord.$type === "string" &&
          currentRecord.$type !== "app.bsky.feed.post") {
        return
      }
      cid = op.cid.toString()
      rkey = op.path.split("/").at(- 1)
      record = currentRecord
    }
    if (record == null) {
      return
    }

    const uri = `at://${did ?? ''}/app.bsky.feed.post/${rkey ?? ''}`
    const feeds: Array<TTFeed> = [{
      __id: uri,
      post: {
        __custom: {},
        author: {
          did: "",
          displayName: "",
          handle: "",
          viewer: {
            muted: false,
          },
        },
        uri,
        cid,
        record,
        replyCount: 0,
        repostCount: 0,
        likeCount: 0,
        quoteCount: 0,
        indexedAt: record.createdAt,
        viewer: {},
      },
    }]
    Util.sanitizePostsOrFeeds(feeds)
    const post = feeds[0].post
    if (this.postCallback != null) {
      this.postCallback(did, post)
    }
  }
}
