interface TTMyLists {
  mainState: MainState
  items: Array<TTList>
  fetchAll: () => Promise<void>
  fetchAllListItems: (uri: string) => Promise<Array<TTListItem>>
  remove: (uri: string) => boolean
  getShortPurpose: (purpose: TTListPurpose) => string
  getLongPurpose: (purpose: string) => TTListPurpose
}
