export default class MyChat {
  mainState: MainState

  myConvos: Array<MyConvo>

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.myConvos = []
  }

  async setDeclaration (allowFollowing: TTAllowIncoming): Promise<boolean> {
    const declarations = await this.mainState.atp.fetchChatDeclarations(this.mainState.atp.data.did, 10)
    if (declarations instanceof Error) {
      // TODO:
      return false
    }

    // 古い Declaration を削除
    // TODO:
    for (const record of declarations.records) {
      await this.mainState.atp.deleteChatDeclaration(this.mainState.atp.data.did, record.uri)
    }
  
    const result = await this.mainState.atp.createChatDeclaration(this.mainState.atp.data.did, allowFollowing)
    if (result instanceof Error) {
      // TODO:
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
    return this.updateConvo(convo)
  }

  async updateConvos (limit?: number): Promise<boolean> {
    const convos = await this.mainState.atp.fetchChatConvos(limit)
    if (convos instanceof Error) {
      // TODO:
      return false
    }
    convos.convos.forEach((convo) => {
      this.updateConvo(convo)
    })
    return true
  }

  updateConvo (newConvo: TIChatConvo): TIMyConvo {
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

  async createMessage (text: string): Promise<boolean> {
    if (this.data == null) {
      return false
    }
    const message = await this.mainState.atp.createChatMessage(this.data.id, text)
    if (message instanceof Error) {
      // TODO:
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
