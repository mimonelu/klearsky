import CONSTS from "@/consts/consts.json"

export default class {
  public mainState: MainState
  public items: Array<TTList>
 
  constructor (mainState: MainState) {
    this.mainState = mainState
    this.items = []
  }

  async fetchAll () {
    const account = this.mainState.atp.session?.did
    if (!account) return
    let cursor: Error | undefined | string

    // ミュートリストを取得
    cursor = undefined
    for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_MY_LIST_ITERATION; i ++) {
      cursor = await this.mainState.atp.fetchListMutes(
        this.items,
        CONSTS.LIMIT_OF_FETCH_MY_LIST,
        cursor as undefined | string
      )
      if (cursor instanceof Error) {
        // TODO:
        break
      }
      if (cursor == null) break
    }

    // ブロックリストを取得
    cursor = undefined
    for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_MY_LIST_ITERATION; i ++) {
      cursor = await this.mainState.atp.fetchListBlocks(
        this.items,
        CONSTS.LIMIT_OF_FETCH_MY_LIST,
        cursor as undefined | string
      )
      if (cursor instanceof Error) {
        // TODO:
        break
      }
      if (cursor == null) break
    }

    // 全マイリストの取得
    cursor = undefined
    for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_MY_LIST_ITERATION; i ++) {
      cursor = await this.mainState.atp.fetchActorLists(
        this.items,
        account,
        CONSTS.LIMIT_OF_FETCH_MY_LIST,
        cursor as undefined | string
      )
      if (cursor instanceof Error) {
        // TODO:
        break
      }
      if (cursor == null) break
    }

    // 全マイリストユーザーの取得
    for (const list of this.items) {
      cursor = undefined
      list.items = []
      for (let i = 0; i < CONSTS.LIMIT_OF_FETCH_MY_LIST_USERS_ITERATION; i ++) {
        const result = await this.mainState.atp.fetchListItems(
          list.items,
          list.uri,
          CONSTS.LIMIT_OF_FETCH_MY_LIST_USERS,
          cursor
        )
        if (result instanceof Error) {
          // TODO:
          break
        }
        if (result == null) break
        cursor = result
      }
    }
  }

  remove (uri: string): boolean {
    const targetIndex = this.items.findIndex((myList: TTList) => {
      return myList.uri === uri
    })
    if (targetIndex === - 1) return false
    this.items.splice(targetIndex, 1)
    return true
  }

  getShortPurpose (purpose?: TTListPurpose): string {
    if (purpose == null) {
      return "unknownlist"
    }
    // 大文字・小文字注意
    return purpose.includes("#modlist")
      ? "modlist"
      : purpose.includes("#curatelist")
        ? "curatelist"
        : purpose.includes("#referencelist")
          ? "referencelist"
          : "unknownlist"
  }

  getLongPurpose (purpose?: string): TTListPurpose {
    if (purpose == null) {
      return "app.bsky.graph.defs#unknownlist"
    }
    return `app.bsky.graph.defs#${purpose}` as TTListPurpose
  }
}
