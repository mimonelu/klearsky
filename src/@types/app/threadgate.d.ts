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

type TTThreadgatePopupProps = {
  display: boolean
  postThreadgate?: TTThreadgate
  postUri?: string
}
