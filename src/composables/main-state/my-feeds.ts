export default class {
  public mainState: MainState
  public items: Array<TTMyFeedsItem>
 
  constructor (mainState: MainState) {
    this.mainState = mainState
    this.items = []
  }

  get savedUris (): Array<string> {
    return this.items
      .filter((item: TTMyFeedsItem) => {
        return item.kind === "feed" || item.kind === "list"
      })
      .map((item: TTMyFeedsItem) => {
        return item.value.uri
      })
  }

  get pinnedUris (): Array<string> {
    return this.items
      .filter((item: TTMyFeedsItem) => {
        return (item.kind === "feed" || item.kind === "list") &&
          this.mainState.feedPreferences?.pinned.includes(item.value.uri)
      })
      .map((item: TTMyFeedsItem) => {
        return item.value.uri
      })
  }

  get pinnedItems (): Array<TTMyFeedsItem> {
    const pinned = this.mainState.feedPreferences?.pinned
    if (pinned == null || pinned.length === 0) {
      return this.customItems
    }
    return this.items.filter((item: TTMyFeedsItem) => {
      return pinned.includes(item.value.uri) || (
        item.kind !== "feed" &&
        item.kind !== "list"
      )
    })
  }

  get customItems (): Array<TTMyFeedsItem> {
    return this.items.filter((item: TTMyFeedsItem) => {
      return (
        item.kind !== "feed" &&
        item.kind !== "list"
      )
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
    this.items.splice(0)

    // フォロー中フィードの追加
    this.items.push({
      kind: "followings",
      value: {
        uri: "followings",
        displayName: "followings",
      },
    })

    // グローバルラインの追加
    this.items.push({
      kind: "globalline",
      value: {
        uri: "globalline",
        displayName: "globalline",
      },
    })

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
    const myFeedsIndex = this.mainState.currentSetting.myFeedsIndex ?? []
    this.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
      let aIndex = myFeedsIndex.indexOf(a.value.uri)
      if (aIndex === - 1) aIndex = saved.indexOf(a.value.uri)
      if (aIndex === - 1) {
        if (a.kind !== "feed" && a.kind !== "list") aIndex = 0
        else aIndex = Number.MAX_SAFE_INTEGER
      }
      let bIndex = myFeedsIndex.indexOf(b.value.uri)
      if (bIndex === - 1) bIndex = saved.indexOf(b.value.uri)
      if (bIndex === - 1) {
        if (b.kind !== "feed" && b.kind !== "list") bIndex = 0
        else bIndex = Number.MAX_SAFE_INTEGER
      }
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

  findIndexByUri (uri: string): number {
    return this.items.findIndex((item: TTMyFeedsItem) => {
      return item.value.uri === uri
    })
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

  swapItem (aIndex: number, bIndex: number) {
    [this.items[aIndex], this.items[bIndex]] = [this.items[bIndex], this.items[aIndex]]
  }

  saveCustomItemSettings () {
    if (this.mainState.currentSetting.myFeedsIndex == null)
      this.mainState.currentSetting.myFeedsIndex = []
    this.mainState.currentSetting.myFeedsIndex.splice(0)
    this.mainState.currentSetting.myFeedsIndex.push(
      ...this.items.map((item: TTMyFeedsItem) => {
        return item.value.uri
      })
    )
    this.mainState.saveSettings()
  }
}
