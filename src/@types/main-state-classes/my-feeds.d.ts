interface TTMyFeeds {
  mainState: MainState
  items: Array<TTMyFeedsItem>
  get savedUris (): Array<string>
  get pinnedUris (): Array<string>
  get pinnedItems (): Array<TTMyFeedsItem>
  get feedGenerators (): Array<TTFeedGenerator>
  fetchItems (): Promise<boolean>
  sortItems (): void
  clearItems (): void
  detectItemKind (uri: string): TTMyFeedsItemKind
  findIndexByUri (uri: string): number
  addItem (target: TTMyFeedsItemValue): void
  removeItem (uri: string): boolean
  swapItem (aIndex: number, bIndex: number): void
  togglePin (uri: string): void
  synchronizeToMyList (): void
  getFeedPreferenceItems (): undefined | Array<TTPreferenceCustomFeedV2Item>
  convertV1ToV2 (): void
  mergeV1ToV2 (): boolean
}

type TTMyFeedsItem = {
  kind: "feed",
  value: TTFeedGenerator
} | {
  kind: "list",
  value: TTList
} | {
  kind: "following" | "space.aoisora.preference.feed.extra"
  value: {
    uri: string
    displayName: string
  }
} | {
  kind: "unknown",
  value: any
}

type TTMyFeedsItemKind = "feed" | "list" | "following" | "space.aoisora.preference.feed.extra" | "unknown"

type TTMyFeedsItemValue = TTFeedGenerator | TTList
