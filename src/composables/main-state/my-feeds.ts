import { TID } from "@atproto/common-web"

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
          this.mainState.currentFeedPreference?.pinned.includes(item.value.uri)
      })
      .map((item: TTMyFeedsItem) => {
        return item.value.uri
      })
  }

  get pinnedItems (): Array<TTMyFeedsItem> {
    const pinned = this.mainState.currentFeedPreference?.pinned
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

    // フィードジェネレーターのURL配列を取得
    const savedFeeds: undefined | Array<string> =
      this.mainState.currentFeedPreference?.saved?.filter((uri: string) => {
        return this.detectItemKind(uri) === "feed"
      })

    // リストのURL配列を取得
    const savedLists: undefined | Array<string> =
      this.mainState.currentFeedPreference?.saved?.filter((uri: string) => {
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

    // フィード＆リストマップ
    const feedAndListMap: { [k: string]: any } = {}

    let hasError = false

    const responses = await Promise.allSettled(tasks)
    responses.forEach((response: PromiseSettledResult<any>) => {
      if (response == null ||
          response.status === "rejected" ||
          response.value instanceof Error
      ) {
        hasError = true
        return
      }

      // フィード＆リストマップにフィードジェネレーターを追加
      if (Array.isArray(response.value)) {
        response.value.forEach((generator: TTFeedGenerator) => {
          feedAndListMap[generator.uri] = generator
        })

      // フィード＆リストマップにリストを追加
      } else {
        feedAndListMap[response.value.uri] = response.value
      }
    })

    // プリファレンスの順番通りにフィードアイテムを構築
    this.mainState.currentFeedPreference?.saved?.forEach((uri: string) => {
      const kind = this.detectItemKind(uri)

      // フィード＆リストマップにあればそれを追加
      if (feedAndListMap[uri] != null) {
        this.items.push({
          kind,
          value: feedAndListMap[uri],
        })
        return
      }

      // フィード＆リストマップにない場合
      if (kind === "feed") {
        const value = {
          avatar: "",
          cid: "",
          creator: {
            did: "",
            displayName: "",
            handle: "",
            viewer: {
              muted: false,
            },
          },
          description: uri,
          did: "",
          displayName: "(Unknown feed)",
          indexedAt: new Date().toISOString(),
          likeCount: 0,
          uri,
          viewer: {},
        }
        this.items.push({ kind, value } as TTMyFeedsItem)
      } else if (kind === "list") {
        const value = {
          uri,
          cid: "",
          creator: {
            did: "",
            handle: "",
          },
          listItemCount: 0,
          name: "(Unknown list)",
          purpose: "unknownlist",
          description: uri,
          indexedAt: new Date().toISOString(),
        }
        this.items.push({ kind, value } as TTMyFeedsItem)
      } else if (kind === "following") {
        const value = {
          uri: "following",
          displayName: "followings",
        }
        this.items.push({ kind, value } as TTMyFeedsItem)
      } else if (kind === "space.aoisora.preference.feed.extra") {
        const value = {
          uri: "globalline",
          displayName: "globalline",
        }
        this.items.push({ kind, value } as TTMyFeedsItem)
      } else {
        const value = {
          uri,
          displayName: "(Unknown item)",
        }
        this.items.push({ kind, value } as TTMyFeedsItem)
      }
    })

    // フォロー中フィードがなければ追加
    if (!this.items.some((item) => {
      return item.kind === "following"
    })) {
      this.items.unshift({
        kind: "following",
        value: {
          uri: "following",
          displayName: "followings",
        },
      })
    }

    // グローバルフィードがなければ追加
    if (!this.items.some((item) => {
      return item.kind === "space.aoisora.preference.feed.extra"
    })) {
      this.items.push({
        kind: "space.aoisora.preference.feed.extra",
        value: {
          uri: "globalline",
          displayName: "globalline",
        },
      })
    }

    return !hasError
  }

  sortItems () {
    const saved = this.mainState.currentFeedPreference?.saved
    if (saved == null) return
    this.items.sort((a: TTMyFeedsItem, b: TTMyFeedsItem) => {
      let aIndex = saved.indexOf(a.value.uri)
      if (aIndex === - 1) {
        if (a.kind !== "feed" && a.kind !== "list") aIndex = 0
        else aIndex = Number.MAX_SAFE_INTEGER
      }
      let bIndex = saved.indexOf(b.value.uri)
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
    if (uri.indexOf("/app.bsky.feed.generator/") !== - 1) {
      return "feed"
    } else if (uri.indexOf("/app.bsky.graph.list/") !== - 1) {
      return "list"
    } else if (uri === "following") {
      return uri
    } else if (uri === "globalline") {
      return "space.aoisora.preference.feed.extra"
    }
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

  removeItem (uri: string): boolean {
    const index = this.items.findIndex((item: TTMyFeedsItem) => {
      return item.value.uri === uri
    })
    if (index !== - 1) {
      this.items.splice(index, 1)
      return true
    }
    return false
  }

  swapItem (aIndex: number, bIndex: number) {
    [this.items[aIndex], this.items[bIndex]] = [this.items[bIndex], this.items[aIndex]]
  }

  togglePin (uri: string) {
    const items = this.getFeedPreferenceItems()
    items?.some((item) => {
      if (item.value === uri) {
        item.pinned = !item.pinned
        return true
      }
      return false
    })
  }

  synchronizeToMyList () {
    this.mainState.myLists!.items.forEach((myList: TTList) => {
      const index = this.items.findIndex((item: TTMyFeedsItem) => {
        return item.value.uri === myList.uri
      })
      if (index === - 1) return
      this.items[index].value = myList
    })
  }

  getFeedPreferenceItems (): undefined | Array<TTPreferenceCustomFeedV2Item> {
    return (this.mainState.currentPreferences.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    }) as undefined | TTPreferenceCustomFeedV2)?.items
  }

  convertV1ToV2 () {
    let preferencesV2 = this.mainState.currentPreferences.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    }) as undefined | TTPreferenceCustomFeedV2
    if (preferencesV2 == null) {
      preferencesV2 = {
        $type: "app.bsky.actor.defs#savedFeedsPrefV2",
        items: [],
      }
    }
    if (preferencesV2.items == null) {
      preferencesV2.items = []
    }
    const idMap: { [k: string]: undefined | string } = {}
    this.items.forEach((item) => {
      const uri = item.value.uri
      const itemV2 = preferencesV2!.items!.find((itemV2) => {
        return itemV2.value === uri
      })
      if (itemV2 == null) {
        // 新規フィードの id を生成
        // id は rkey 同様 TID 形式。現在時刻を元に生成する
        for (let i = 0; i < 100; i ++) {
          const id = TID.next().str
          if (Object.keys(idMap).every((mapId) => {
            return mapId !== id
          })) {
            idMap[uri] = id
            break
          }
        }
        if (idMap[uri] == null) {
          // TODO: ここに到達することはまずないが、何かしらエラーメッセージを表示すること
        }
        return
      }
      idMap[uri] = itemV2.id
    })
    const itemsV2 = this.items
      ?.filter((item) => {
        return idMap[item.value.uri] != null
      })
      .map((item) => {
        const type = item.kind === "following"
          ? "timeline"
          : item.kind
        const pinned = item.kind === "following" || item.kind === "space.aoisora.preference.feed.extra"
          ? true
          : this.pinnedUris?.some((uri) => {
            return uri === item.value.uri
          })
        return {
          id: idMap[item.value.uri] as string,
          type,
          value: item.value.uri,
          pinned,
        }
      }) ?? []
    preferencesV2.items.splice(0, preferencesV2.items.length, ...itemsV2 as any)
  }

  // Preferences の V1 フィードを currentFeedPreference にマージ
  mergeV1ToV2 (): boolean {
    const preferencesV1 = this.mainState.currentPreferences.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    }) as undefined | TTPreferenceCustomFeedV1
    if (preferencesV1?.saved == null ||
        this.mainState.currentFeedPreference?.saved == null
    ) {
      return false
    }
    preferencesV1.saved.forEach((uri) => {
      const index = this.mainState.currentFeedPreference.saved.indexOf(uri)
      if (index !== - 1) {
        return
      }
      this.mainState.currentFeedPreference.saved.push(uri)
    })
    if (preferencesV1?.pinned == null ||
        this.mainState.currentFeedPreference?.pinned == null
    ) {
      return false
    }
    preferencesV1.pinned.forEach((uri) => {
      const index = this.mainState.currentFeedPreference.pinned.indexOf(uri)
      if (index !== - 1) {
        return
      }
      this.mainState.currentFeedPreference.pinned.push(uri)
    })
    return true
  }
}
