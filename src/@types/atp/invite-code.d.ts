type TTInviteCode = {
  code: string
  available: number
  disabled: boolean
  forAccount: string
  createdBy: string
  createdAt: string
  uses: {
    usedBy: string
    usedAt: string
    [k: string]: unknown
  }[]
  [k: string]: unknown
}
