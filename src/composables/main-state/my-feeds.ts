export default class {
  public mainState: MainState
  public items: Array<TTMyFeedsItem>
 
  constructor (mainState: MainState) {
    this.mainState = mainState
    this.items = []
  }

  get pinnedItems (): Array<TTMyFeedsItem> {
    const pinned = this.mainState.feedPreferences?.pinned
    if (pinned == null || pinned.length === 0) return []
    return this.items.filter((item: TTMyFeedsItem) => {
      return pinned.includes(item.value.uri)
    })
  }

  get feedGenerators (): Array<TTFeedGenerator> {
    return this.items
      .filter((item: TTMyFeedsItem) => {
        return item.kind === "feed"
      })
      .map((item: TTMyFeedsItem) => {
        return item.value
      })
  }

  async fetchItems (): Promise<boolean> {
    // フィードジェネレーターのURL配列を取得
    const savedFeeds: undefined | Array<string> =
      this.mainState.feedPreferences?.saved?.filter((uri: string) => {
        return this.detectItemKind(uri) === "feed"
      })

    // リストのURL配列を取得
    const savedLists: undefined | Array<string> =
      this.mainState.feedPreferences?.saved?.filter((uri: string) => {
        return this.detectItemKind(uri) === "list"
      })

    const tasks: Array<Promise<Error | any>> = []

    // フィードジェネレーターを取得
    if (savedFeeds != null && savedFeeds.length > 0) {
      tasks.push(this.mainState.atp.fetchFeedGenerators(savedFeeds))
    }

    // リストを取得
    if (savedLists != null) {
      savedLists.forEach(async (uri: string) => {
        tasks.push(this.mainState.atp.fetchList(uri))
      })
    }

    const responses = await Promise.allSettled(tasks)
    this.items.splice(0)
    responses.forEach((response: PromiseSettledResult<any>) => {
      if (response.status === "rejected") {
        this.mainState.openErrorPopup("errorApiFailed", "MyFeeds/fetchList")
        return
      }
      if (response instanceof Error) {
        this.mainState.openErrorPopup("errorApiFailed", "MyFeeds/fetchList")
        return
      }

      // マイフィードにフィードジェネレーターを追加
      if (Array.isArray(response.value)) {
        response.value.forEach((generator: TTFeedGenerator) => {
          this.items.push({
            kind: "feed",
            value: generator,
          })
        })

      // マイフィードにリストを追加
      } else {
        this.items.push({
          kind: "list",
          value: response.value,
        })
      }
    })
    return true
  }

  sortItems () {
    const saved = this.mainState.feedPreferences?.saved
    if (saved == null) return
    this.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
      const aSavedIndex = saved.indexOf(a.value.uri)
      const bSavedIndex = saved.indexOf(b.value.uri)
      const aIndex = aSavedIndex !== - 1
          ? aSavedIndex
          : Number.MAX_SAFE_INTEGER
      const bIndex = bSavedIndex !== - 1
          ? bSavedIndex
          : Number.MAX_SAFE_INTEGER
      return aIndex < bIndex ? - 1 : aIndex > bIndex ? 1 : 0
    })
  }

  clearItems () {
    this.items.splice(0)
  }

  detectItemKind (uri: string): TTMyFeedsItemKind {
    if (uri.indexOf("/app.bsky.feed.generator/") !== - 1) return "feed"
    else if (uri.indexOf("/app.bsky.graph.list/") !== - 1) return "list"
    return "unknown"
  }

  addItem (target: TTMyFeedsItemValue) {
    if (this.items.findIndex((item: TTMyFeedsItem) => {
      return item.value.uri === target.uri
    }) === - 1) {
      this.items.push({
        kind: this.detectItemKind(target.uri),
        value: target as any,
      })
    }
  }

  removeItem (uri: string) {
    /*
    this.items = this.items.filter((item: TTMyFeedsItem) => {
      return item.uri !== uri
    })
    */
    const index = this.items.findIndex((item: TTMyFeedsItem) => {
      return item.value.uri === uri
    })
    if (index !== - 1) this.items.splice(index, 1)
  }
}
