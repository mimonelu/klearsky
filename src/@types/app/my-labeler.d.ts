interface TIMyLabeler {
  mainState: MainState
  labelers: Array<TILabeler>
  subscribe (did: string)
  unsubscribe (did: string)
  indexOfMyLabelerPrefferences (did: string): number
  getMyLabelerPrefferences (): Array<{ did: string }>
  getMyLabelerPrefferenceDids (): string[]
  async fetchMyLabelers(): Promise<boolean>
  findMyLabelerLabel (did: string, val: string): undefined | TILabelerLabel
  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel>
  setAtprotoAcceptLabelers (): void
}
