export default class MyConvo {
  mainState: MainState

  data?: TIChatConvo

  messages: Array<TIChatMessage>

  cursor?: string

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.data = undefined
    this.messages = []
    this.cursor = undefined
  }

  getMemberNames (): Array<string> {
    return this.data?.members
      .filter((member) => member.did !== this.mainState.atp.data.did)
      .map((member) => member.displayName || member.handle) ?? []
  }

  async createMessage (params: TTCreatePostParams): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const message = await this.mainState.atp.createChatMessage(
      this.data.id,
      params
    )
    if (message instanceof Error) {
      this.mainState.openErrorPopup(message, "MyChat/createMessage")
      return false
    }
    this.messages.push(message)
    this.sortMessages()
    this.data.lastMessage = message
    this.mainState.myChat!.sortMyConvos()
    return true
  }

  async updateMessages (limit?: number, isNew = true): Promise<number> {
    if (this.data == null) {
      return - 1
    }
    const messages = await this.mainState.atp.fetchChatMessages(
      this.data.id,
      limit,
      isNew ? undefined : this.cursor
    )
    if (messages instanceof Error) {
      // エラーメッセージは表示しない
      return - 1
    }
    this.cursor = messages.cursor
    let numberOfNewMessages = 0
    messages.messages.forEach((dst) => {
      const srcIndex = this.messages.findIndex((src) => {
        return src.id === dst.id
      })
      if (srcIndex === - 1) {
        this.messages.push(dst)
        numberOfNewMessages ++
      } else {
        this.messages[srcIndex] = dst
      }
    })
    this.sortMessages()
    return numberOfNewMessages
  }

  async deleteMessage (messageId: string): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const result = await this.mainState.atp.deleteChatMessage(this.data.id, messageId)
    if (result instanceof Error) {
      this.mainState.openErrorPopup(result, "MyChat/deleteMessage")
      return false
    }
    const index = this.messages.findIndex((message) => message.id === messageId)
    if (index !== - 1) {
      this.messages.splice(index, 1)
    }
    if (this.data?.lastMessage != null) {
      delete this.data.lastMessage.text
    }
    this.mainState.myChat!.sortMyConvos()
    return true
  }

  async updateRead (messageId?: string): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const messages = await this.mainState.atp.updateChatConvoRead(this.data.id, messageId)
    if (messages instanceof Error) {
      // エラーメッセージは表示しない
      return false
    }
    this.data.unreadCount = 0
    this.mainState.myChat!.updateUnread()
    return true
  }

  async mute (): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const result = await this.mainState.atp.muteChatConvo(this.data.id)
    if (result instanceof Error) {
      this.mainState.openErrorPopup(result, "MyChat/mute")
      return false
    }
    const myConvo = this.mainState.myChat!.myConvos.find((myConvo) => {
      return myConvo.data?.id === this.data?.id
    })
    if (myConvo.data != null) {
      myConvo.data.muted = true
    }
    this.mainState.myChat!.sortMyConvos()
    return true
  }

  async unmute (): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const result = await this.mainState.atp.unmuteChatConvo(this.data.id)
    if (result instanceof Error) {
      this.mainState.openErrorPopup(result, "MyChat/unmute")
      return false
    }
    const myConvo = this.mainState.myChat!.myConvos.find((myConvo) => {
      return myConvo.data?.id === this.data?.id
    })
    if (myConvo.data != null) {
      myConvo.data.muted = false
    }
    this.mainState.myChat!.sortMyConvos()
    return true
  }

  async leave (): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const result = await this.mainState.atp.leaveChatConvo(this.data.id)
    if (result instanceof Error) {
      this.mainState.openErrorPopup(result, "MyChat/leave")
      return false
    }
    const index = this.mainState.myChat!.myConvos.findIndex((myConvo) => {
      return myConvo.data?.id === this.data?.id
    })
    if (index !== - 1) {
      this.mainState.myChat!.myConvos.splice(index, 1)
    }
    return true
  }

  sortMessages () {
    this.messages.sort((a, b) => {
      const dateA = new Date(a.sentAt)
      const dateB = new Date(b.sentAt)
      return dateA < dateB ? - 1 : dateA > dateB ? 1 : 0
    })
  }

  findMember (did: string): undefined | TTProfile {
    return this.data?.members.find((member) => member.did === did)
  }
}
