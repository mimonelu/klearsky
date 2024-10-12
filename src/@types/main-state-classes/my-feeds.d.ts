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
  saveCustomItemSettings (): void
  synchronizeToMyList (): void
}

type TTMyFeedsItem = {
  kind: "feed",
  value: TTFeedGenerator
} | {
  kind: "list",
  value: TTList
} | {
  kind: "following" | "globalline"
  value: {
    uri: string
    displayName: string
  }
} | {
  kind: "unknown",
  value: any
}

type TTMyFeedsItemKind = "feed" | "list" | "following" | "globalline" | "unknown"

type TTMyFeedsItemValue = TTFeedGenerator | TTList