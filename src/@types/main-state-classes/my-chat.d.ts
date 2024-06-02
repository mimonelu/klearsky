interface TIMyChat {
  mainState: MainState
  disabled: boolean
  myConvos: Array<MyConvo>
  unread: number
  async updateDisabled (): Promise<void>
  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean>
  async fetchMyConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  async updateConvos (limit?: number): Promise<undefined | string>
  async updateConvosAll (): Promise<boolean>
  sortMyConvos(): void
  updateUnread(): void
}
