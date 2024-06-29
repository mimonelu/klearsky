interface TTMyLists {
  mainState: MainState
  items: Array<TTList>
  fetchAll: () => Promise<void>
  remove: (uri: string) => boolean
  getShortPurpose: (purpose: TTListPurpose) => string
  getLongPurpose: (purpose: string) => TTListPurpose
}
