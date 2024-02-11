interface TTMyLists {
  mainState: MainState
  items: Array<TTList>
  fetchAll: () => Promise<void>
  remove: (uri: string) => boolean
}
