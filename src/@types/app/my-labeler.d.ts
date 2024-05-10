interface TIMyLabeler {
  mainState: MainState
  labelers: Array<TILabeler>
  labelMap: { [did: string]: TILabelerLabel }
  subscribe (did: string)
  unsubscribe (did: string)
  indexOfMyLabelerPrefferences (did: string): number
  getMyLabelerPrefferences (): Array<{ did: string }>
  makeMyLabelerPrefferenceDids (): string[]
  async fetchMyLabelers(): Promise<boolean>
  updateLabelMap (): void
  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale
  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel>
  setAtprotoAcceptLabelers (): void
}
