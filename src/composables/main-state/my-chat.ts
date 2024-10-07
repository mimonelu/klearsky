import MyConvo from "@/composables/main-state/my-convo"

export default class MyChat {
  mainState: MainState

  disabled: boolean

  myConvos: Array<MyConvo>

  unread: number

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.disabled = true
    this.myConvos = []
    this.unread = 0
  }

  async updateDisabled (): Promise<void> {
    // 引数なしで getLog() をコールし、失敗すればチャットを利用できない環境とみなしている
    // TODO: AppPasswords にチャット権限がない、もしくは非公式 PDS であるかどうかで判定すること
    const chatLogs = await this.mainState.atp.fetchChatLogs()
    this.disabled = chatLogs instanceof Error
  }

  async setDeclaration (allowIncoming: TTAllowIncoming): Promise<boolean> {
    const declarations = await this.mainState.atp.fetchChatDeclarations(this.mainState.atp.data.did, 1)
    if (declarations instanceof Error || declarations.records.length === 0) {
      // 作成
      const result = await this.mainState.atp.createChatDeclaration(
        this.mainState.atp.data.did,
        allowIncoming
      )
      if (result instanceof Error) {
        this.mainState.openErrorPopup(result, "MyChat/setDeclaration")
        return false
      }
    } else {
      // 更新
      const uri = declarations.records[0].uri

      // AtpAgent に更新用のメソッドがないため、直接レコードを更新している
      const result = await this.mainState.atp.updateRecord(
        this.mainState.atp.data.did,
        "chat.bsky.actor.declaration",
        uri,
        {
          "$type": "chat.bsky.actor.declaration",
          allowIncoming,
        }
      )
      if (result instanceof Error) {
        this.mainState.openErrorPopup(result, "MyChat/setDeclaration")
        return false
      }
    }
    return true
  }

  async fetchMyConvo (dids: Array<string>): Promise<undefined | TIMyConvo> {
    const convo = await this.mainState.atp.fetchChatConvo(dids)
    if (convo instanceof Error) {
      if ((convo as any).error === "InvalidToken") {
        // AppPasswords にチャット権限がない場合は専用メッセージを表示
        this.mainState.openErrorPopup("errorInvalidChatToken", "MyChat/fetchMyConvo")
      } else {
        // 上記以外のエラーは通常通り表示
        this.mainState.openErrorPopup(convo, "MyChat/fetchMyConvo")
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
      if (result.cursor == null ||
          result.convos.length === 0
      ) {
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
    // lastMessage の日時でソート
    this.myConvos.sort((a, b) => {
      const aDate = new Date(a.data?.lastMessage?.sentAt ?? 0)
      const bDate = new Date(b.data?.lastMessage?.sentAt ?? 0)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })

    // ミュートチャットを最下段へ移動
    this.myConvos.sort((a, b) => {
      const aScore = (a.data?.muted ?? false) ? 0 : 1
      const bScore = (b.data?.muted ?? false) ? 0 : 1
      return aScore < bScore ? 1 : aScore > bScore ? - 1 : 0
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
