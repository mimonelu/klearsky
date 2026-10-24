interface TIMyConvo {
  mainState: MainState
  data?: TIChatConvo
  messages: Array<TIChatMessage>
  logsCursor?: string
  messagesCursor?: string
  getMemberNames (): Array<string>
  createMessage (params: TTCreatePostParams): Promise<boolean>
  updateMessages (limit?: number, isNew?: boolean): Promise<number>
  deleteMessage (messageId: string): Promise<boolean>
  checkNewMessages (): Promise<boolean>
  updateRead (messageId?: string): Promise<boolean>
  mute (): Promise<boolean>
  unmute (): Promise<boolean>
  accept (): Promise<boolean>
  leave (): Promise<boolean>
  findMember (did: string): undefined | TTUser
}
