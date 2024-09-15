interface TIPostgate {
  $type: "app.bsky.feed.postgate"
  createdAt: string
  detachedEmbeddingUris?: Array<string>
  embeddingRules?: Array<{ [k: string]: string }>
  post: string
}

type TTThreadgate = {
  uri: string
  cid: string
  record: {
    post: string
    $type: string
    allow: Array<TTThreadgateAllow>
    createdAt: string
  }
  lists: Array<TTThreadgateList>
}

type TTThreadgateAllow = {
  $type: string
  list?: Array<string>
}

type TTThreadgateList = {
  uri: string
  cid: string
  name: string
  purpose: string
  indexedAt: string
  viewer: {
    muted: boolean
  }
}

type TTThreadgateAction = "none" | "custom"

type TTDraftReactionControl = {
  postgateAllow: boolean
  threadgateAction: TTThreadgateAction
  allowMention: boolean
  allowFollowing: boolean
  listUris: Array<string>
}

type TTReactionControlPopupProps = {
  display: boolean
  mode?: "send" | "post"
  isReply: boolean
  draftReactionControl?: TTDraftReactionControl
  postThreadgate?: TTThreadgate
  postUri?: string
  onClosed?: Function
}

interface TICloseReactionControlPopupProps {
  updated: boolean
  postgateAllow: boolean
  threadgateAction: TTThreadgateAction
  allowMention?: boolean
  allowFollowing?: boolean
  listUris?: Array<string>
}
