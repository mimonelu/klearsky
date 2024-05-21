export default class MyChat {
  mainState: MainState

  myConvos: Array<MyConvo>

  unread: number

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.myConvos = []
    this.unread = 0
  }

  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean> {
    const declarations = await this.mainState.atp.fetchChatDeclarations(this.mainState.atp.data.did, 10)
    if (declarations instanceof Error) {
      this.mainState.openErrorPopup(declarations, "MyChat/setDeclaration")
      return false
    }

    // 古い Declaration を削除
    // TODO:
    for (const record of declarations.records) {
      await this.mainState.atp.deleteChatDeclaration(this.mainState.atp.data.did, record.uri)
    }
  
    const result = await this.mainState.atp.createChatDeclaration(this.mainState.atp.data.did, allowFollowing)
    if (result instanceof Error) {
      this.mainState.openErrorPopup(result, "MyChat/setDeclaration")
      return false
    }
    return true
  }

  async upsertConvo (dids: Array<string>): Promise<undefined | TIMyConvo> {
    const convo = await this.mainState.atp.fetchChatConvo(dids)
    if (convo instanceof Error) {
      this.mainState.openErrorPopup(convo, "MyChat/upsertConvo")
      return
    }
    return this.updateMyConvo(convo)
  }

  async updateConvos (limit?: number): Promise<boolean> {
    const convos = await this.mainState.atp.fetchChatConvos(limit)
    if (convos instanceof Error) {
      // TODO:
      return false
    }
    convos.convos.forEach((convo) => {
      this.updateMyConvo(convo)
    })
    this.updateUnread()
    return true
  }

  updateMyConvo (newConvo: TIChatConvo): TIMyConvo {
    const myConvo = new MyConvo(this.mainState)
    myConvo.data = newConvo
    const myConvoIndex = this.myConvos.findIndex((myConvo) => {
      return myConvo.data?.id === newConvo.id
    })
    if (myConvoIndex === - 1) {
      this.myConvos.push(myConvo)
    } else {
      this.myConvos[myConvoIndex] = myConvo
    }
    return myConvo
  }

  updateUnread () {
    this.unread = 0
    this.myConvos.forEach((myConvo) => {
      if (!myConvo.data?.muted) {
        this.unread += myConvo.data?.unreadCount ?? 0
      }
    })
  }
}

class MyConvo {
  mainState: MainState

  data?: TIChatConvo

  messages: Array<TIChatMessage>

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.data = undefined
    this.messages = []
  }

  getMemberNames (): Array<string> {
    return this.data?.members
      .filter((member) => member.did !== this.mainState.atp.data.did)
      .map((member) => member.displayName || member.handle) ?? []
  }

  async createMessage (text: string): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const message = await this.mainState.atp.createChatMessage(this.data.id, text)
    if (message instanceof Error) {
      this.mainState.openErrorPopup(message, "MyChat/createMessage")
      return false
    }
    this.messages.push(message)
    this.sortMessages()
    return true
  }

  async updateMessages (limit?: number): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const messages = await this.mainState.atp.fetchChatMessages(this.data.id, limit)
    if (messages instanceof Error) {
      // TODO:
      return false
    }
    messages.messages.forEach((dst) => {
      const srcIndex = this.messages.findIndex((src) => {
        return src.id === dst.id
      })
      if (srcIndex === - 1) {
        this.messages.push(dst)
      } else {
        this.messages[srcIndex] = dst
      }
    })
    this.sortMessages()
    return true
  }

  async updateRead (messageId?: string): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const messages = await this.mainState.atp.updateChatConvoRead(this.data.id, messageId)
    if (messages instanceof Error) {
      // TODO:
      return false
    }
    this.data.unreadCount = 0
    this.mainState.myChat.updateUnread()
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
    const myConvo = this.mainState.myChat.myConvos.find((myConvo) => myConvo.data?.id === this.data?.id)
    if (myConvo.data != null) {
      myConvo.data.muted = true
    }
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
    const myConvo = this.mainState.myChat.myConvos.find((myConvo) => myConvo.data?.id === this.data?.id)
    if (myConvo.data != null) {
      myConvo.data.muted = false
    }
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
    const index = this.mainState.myChat.myConvos.findIndex((myConvo) => myConvo.data?.id === this.data?.id)
    if (index !== - 1) {
      this.mainState.myChat.myConvos.splice(index, 1)
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
