interface TIMyChat {
  mainState: MainState
  myConvos: Array<MyConvo>
  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean>
  async upsertConvo (dids: Array<string>): Promise<undefined | TIMyConvo>
  async updateConvos (): Promise<boolean>
}

interface TIMyConvo {
  mainState: MainState
  data?: TIChatConvo
  messages: Array<TIChatMessage>
  async createMessage (text: string): Promise<boolean>
  async updateMessages (): Promise<boolean>
  findMember (did: string): undefined | TTProfile
}
