export default class MyChat {
  mainState: MainState

  disabled: boolean

  myConvos: Array<MyConvo>

  unread: number

  lastCursor?: string

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.disabled = true
    this.myConvos = []
    this.unread = 0
  }

  async updateDisabled (): Promise<void> {
    const chatLogs = await this.mainState.atp.fetchChatLogs()
    this.disabled = chatLogs instanceof Error
  }

  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean> {
    // 古い Declaration を削除
    // TODO:
    const declarations = await this.mainState.atp.fetchChatDeclarations(this.mainState.atp.data.did, 3)
    if (!(declarations instanceof Error)) {
      for (const record of declarations.records) {
        await this.mainState.atp.deleteChatDeclaration(this.mainState.atp.data.did, record.uri)
      }
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
      if ((convo as any).error === "InvalidToken") {
        this.mainState.openErrorPopup("errorInvalidChatToken", "MyChat/upsertConvo")
      } else {
        this.mainState.openErrorPopup(convo, "MyChat/upsertConvo")
      }
      return
    }
    return this.updateMyConvo(convo, "unshift")
  }

  async updateConvos (limit?: number): Promise<undefined | string> {
    const result = await this.mainState.atp.fetchChatConvos(limit)
    if (result instanceof Error) {
      // エラーメッセージは表示しない
      return
    }
    result.convos.forEach((convo) => {
      this.updateMyConvo(convo, "push")
    })
    this.sortMyConvos()
    this.updateUnread()
    return result.cursor
  }

  async updateConvosAll (): Promise<boolean> {
    let cursor: undefined | string
    // 実際には全件ではなく 50 * 20 = 1000 件まで取得する
    for (let i = 0; i < 20; i ++) {
      const result = await this.mainState.atp.fetchChatConvos(undefined, cursor)
      if (result instanceof Error) {
        // 途中でエラーが発生したら終了。エラーメッセージは表示しない
        return false
      }
      result.convos.forEach((convo) => {
        this.updateMyConvo(convo, "push")
      })
      if (result.cursor == null || result.convos.length === 0) {
        break
      }
      cursor = result.cursor
    }
    this.sortMyConvos()
    this.updateUnread()
    return true
  }

  updateMyConvo (newConvo: TIChatConvo, method: "push" | "unshift"): TIMyConvo {
    const myConvo = new MyConvo(this.mainState)
    myConvo.data = newConvo
    const myConvoIndex = this.myConvos.findIndex((myConvo) => {
      return myConvo.data?.id === newConvo.id
    })
    if (myConvoIndex === - 1) {
      this.myConvos[method](myConvo)
    } else {
      this.myConvos[myConvoIndex] = myConvo
    }
    return myConvo
  }

  sortMyConvos () {
    this.myConvos.sort((a, b) => {
      const aDate = new Date(a.data?.lastMessage?.sentAt ?? 0)
      const bDate = new Date(b.data?.lastMessage?.sentAt ?? 0)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })
  }

  updateUnread () {
    this.unread = 0
    this.myConvos.forEach((myConvo) => {
      if (!myConvo.data?.muted) {
        this.unread += myConvo.data?.unreadCount ?? 0
      }
    })
    this.mainState.updatePageTitle()
  }
}

class MyConvo {
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
    this.mainState.myChat.sortMyConvos()

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
      // TODO:
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
