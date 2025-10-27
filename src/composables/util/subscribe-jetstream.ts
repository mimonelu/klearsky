import Util from "@/composables/util"

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
    $warn("subscribeJetstream", event)
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
    if (this.messageCallback != null) {
      this.messageCallback()
    }
    const data = Util.parse(messageEvent.data)
    if (
      data?.did == null ||
      data?.commit?.rkey == null ||
      data?.commit?.record == null ||
      data?.commit?.collection !== "app.bsky.feed.post" ||
      data?.commit?.operation !== "create"
    ) {
      return
    }
    const did = data.did
    const uri = `at://${did ?? ''}/app.bsky.feed.post/${data.commit?.rkey ?? ''}`
    const record = data.commit?.record
    const feeds: Array<TTFeed> = [{
      __id: uri,
      post: {
        __custom: {},
        author: {
          did: "",
          displayName: "",
          handle: "",
          viewer: {},
        },
        uri,
        cid: data.commit?.cid,
        record,
        replyCount: 0,
        repostCount: 0,
        likeCount: 0,
        quoteCount: 0,
        indexedAt: record?.createdAt,
        viewer: {},
      },
    }]
    if (this.postCallback != null) {
      Util.sanitizePostsOrFeeds(feeds)
      this.postCallback(did, feeds[0].post)
    }
  }
}
