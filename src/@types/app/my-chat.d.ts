interface TIMyChat {
  mainState: MainState
  myConvos: Array<MyConvo>
  unread: number
  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean>
  async upsertConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  async updateConvos (limit?: number): Promise<boolean>
  updateUnread(): void
}

interface TIMyConvo {
  mainState: MainState
  data?: TIChatConvo
  messages: Array<TIChatMessage>
  getMemberNames (): Array<string>
  async createMessage (text: string): Promise<boolean>
  async updateMessages (limit?: number): Promise<boolean>
  async updateRead (messageId?: string): Promise<boolean>
  findMember (did: string): undefined | TTProfile
}
