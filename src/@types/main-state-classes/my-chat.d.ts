interface TIMyChat {
  mainState: MainState
  disabled: boolean
  myConvos: Array<MyConvo>
  unread: number
  logsCursor: undefined | string
  async updateDisabled (): Promise<void>
  async checkNewLogs (): Promise<Array<string>>
  async setAllowIncoming (allowIncoming: TTAllowIncoming): Promise<boolean>
  async setAllowGroupInvites (allowGroupInvites: TTAllowGroupInvites): Promise<boolean>
  async setDeclaration (allowIncoming: TTAllowIncoming, allowGroupInvites: TTAllowGroupInvites): Promise<boolean>
  async fetchMyConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  async updateConvos (convoIds: Array<string>): Promise<void>
  async updateConvosAll (): Promise<boolean>
  sortMyConvos(): void
  updateUnread(): void
}
