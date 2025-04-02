type TTAllowIncoming = "all" | "none" | "following" | (string & {})

interface TIChatConvo {
  id: string
  lastMessage?: TIChatMessage
  lastReaction?: {
    $type: string
    message: TIChatMessage
    reaction: TIChatReaction
  }
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
  reactions?: TIChatReaction[]
  rev: string
  sender: { did: string }
  sentAt: string
  text?: string
  [k: string]: unknown
}

interface TIChatReaction {
  createdAt: string
  sender: { did: string }
  value: string
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
