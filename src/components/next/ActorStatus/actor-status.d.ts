interface TIActorStatus {
  embed?: {
    $type: string
    external: TTExternal
  }
  expiresAt: string
  isActive: boolean
  record: TIActorStatusRecord
  status: string
}

interface TIActorStatusRecord {
  $type: string
  createdAt: string
  durationMinutes?: number
  embed?: {
    $type: string
    external: TTExternal
  }
  status: string

  // Injected
  __expiredAt: string
}

interface TIActorStatusEditPopupProps {
  display: boolean
}
