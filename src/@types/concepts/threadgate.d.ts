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

type TTDraftThreadgate = {
  applied: boolean
  allowMention: boolean
  allowFollowing: boolean
  listUris: Array<string>
}

type TTThreadgatePopupProps = {
  display: boolean
  mode?: "send" | "post"
  draftThreadgate?: TTDraftThreadgate
  postThreadgate?: TTThreadgate
  postUri?: string
  onClosed?: Function
}
