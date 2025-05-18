interface TIActorStatus {
  embed?: {
    $type: string
    external: TTExternal
  }
  expiresAt: string
  isActive: boolean
  record: {
    $type: string
    createdAt: string
    durationMinutes?: number
    embed?: {
      $type: string
      external: TTExternal
    }
    status: string
  }
  status: string
}

interface TIActorStatusEditPopupProps {
  display: boolean
}
