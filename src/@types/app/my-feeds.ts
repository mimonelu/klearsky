interface TTMyFeeds {
  mainState: MainState
  items: Array<TTMyFeedsItem>
  get pinnedItems (): Array<TTMyFeedsItem>
  get feedGenerators (): Array<TTFeedGenerator>
  fetchItems (): Promise<boolean>
  sortItems (): void
  clearItems (): void
  detectItemKind (uri: string): TTMyFeedsItemKind
  addItem (target: TTMyFeedsItemValue): void
  removeItem (uri: string): void
}

type TTMyFeedsItem = {
  kind: "feed",
  value: TTFeedGenerator
} | {
  kind: "list",
  value: TTList
} | {
  kind: "unknown",
  value: any
}

type TTMyFeedsItemKind = "feed" | "list" | "unknown"

type TTMyFeedsItemValue = TTFeedGenerator | TTList