interface TIMyChat {
  mainState: MainState
  disabled: boolean
  myConvos: Array<MyConvo>
  unread: number
  logsCursor: undefined | string
  updateDisabled (): Promise<void>
  checkNewLogs (): Promise<Array<string>>
  setAllowIncoming (allowIncoming: TTAllowIncoming): Promise<boolean>
  setAllowGroupInvites (allowGroupInvites: TTAllowGroupInvites): Promise<boolean>
  setDeclaration (allowIncoming: TTAllowIncoming, allowGroupInvites: TTAllowGroupInvites): Promise<boolean>
  fetchMyConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  updateConvos (convoIds: Array<string>): Promise<void>
  updateConvosAll (): Promise<boolean>
  sortMyConvos(): void
  updateUnread(): void
}
