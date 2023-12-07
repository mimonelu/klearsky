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

type TTSendThreadgate = {
  applied: boolean
  allowMention: boolean
  allowFollowing: boolean
  listUris: Array<string>
}

type TTThreadgatePopupProps = {
  display: boolean
  mode?: "send" | "post"
  sendThreadgate?: TTSendThreadgate
  postThreadgate?: TTThreadgate
  postUri?: string
  onClosed?: Function
}
