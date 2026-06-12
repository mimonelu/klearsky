type TTChatConvoStatus = "accepted" | "request" | "declined"

type TTAllowIncoming = "all" | "none" | "following" | (string & {})

interface TIChatConvo {
  id: string
  lastMessage?: TIChatMessage
  members: TTUser[]
  muted: boolean
  rev: string
  status: TTChatConvoStatus
  unreadCount: number
}

interface TIChatMessage {
  $type: "chat.bsky.convo.defs#messageView"
  data: {
    $type: "chat.bsky.convo.defs#systemMessageDataEditGroup"
    newName: string
    oldName: string
  } | {
    $type:
      "chat.bsky.convo.defs#systemMessageDataAddMember" |
      "chat.bsky.convo.defs#systemMessageDataMemberLeave"
    member: {
      did: string
    }
    role?: string,
    addedBy?: {
      did: string
    }
  } | {
    $type:
      "chat.bsky.convo.defs#systemMessageDataLockConvo" |
      "chat.bsky.convo.defs#systemMessageDataUnlockConvo"
    lockedBy: {
      did: string
    }
  }
  embed?: any
  facets?: any
  id: string
  reactions?: TIChatReaction[]
  rev: string
  sender?: { did: string }
  sentAt: string
  text?: string
  [k: string]: unknown
}

interface TIChatReaction {
  createdAt: string
  sender: { did: string }
  value: string
}

interface TIFetchChatLogsResponse {
  logs: Array<TIChatLog>
  cursor?: string
}

interface TIChatLog {
  rev: string
  convoId: string
  message?: TIChatMessage
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
