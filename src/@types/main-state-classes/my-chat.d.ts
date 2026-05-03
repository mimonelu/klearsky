interface TIMyChat {
  mainState: MainState
  disabled: boolean
  myConvos: Array<MyConvo>
  unread: number
  logCursor: undefined | string
  async updateDisabled (): Promise<void>
  async checkNewLogs (): Promise<Array<string>>
  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean>
  async fetchMyConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  async updateConvos (convoIds: Array<string>): Promise<void>
  async updateConvosAll (): Promise<boolean>
  sortMyConvos(): void
  updateUnread(): void
}
