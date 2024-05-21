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
  cursor?: string
  getMemberNames (): Array<string>
  async createMessage (params: TTCreatePostParams): Promise<boolean>
  async updateMessages (limit?: number, isNew = true): Promise<number>
  async deleteMessage (messageId: string): Promise<boolean>
  async updateRead (messageId?: string): Promise<boolean>
  async mute (): Promise<boolean>
  async unmute (): Promise<boolean>
  async leave (): Promise<boolean>
  findMember (did: string): undefined | TTProfile
}
