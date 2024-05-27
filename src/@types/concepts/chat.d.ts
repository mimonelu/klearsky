type TTAllowIncoming = "all" | "none" | "following" | (string & {})

interface TIChatConvo {
  id: string
  lastMessage?: TIChatMessage
  members: TTProfile[]
  muted: boolean
  rev: string
  unreadCount: number
}

interface TIChatMessage {
  $type: string
  embed?: any
  facets?: any
  id: string
  rev: string
  sender: { did: string }
  sentAt: string
  text?: string
  [k: string]: unknown
}

interface TIFetchChatDeclarationsResponse {
  cursor?: string
  records: {
    uri: string
    value: {
      allowIncoming: TTAllowIncoming
    }
  }[]
}

interface TIFetchChatConvosResponse {
  cursor?: string
  convos: Array<TIChatConvo>
}
