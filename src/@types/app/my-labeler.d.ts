interface TIMyLabeler {
  mainState: MainState
  labelers: Array<TILabeler>
  labelMap: { [did: string]: TILabelerLabel }
  subscribe (did: string, labeler: TILabeler)
  unsubscribe (did: string)
  getMyLabelerPrefferences (): Array<{ did: string }>
  makeMyLabelerPrefferenceDids (): string[]
  async fetchLabeler (did: string): Promise<undefined | TILabeler>
  async updateCurrentLabeler (did: string): Promise<boolean>
  async updateMyLabelers(): Promise<boolean>
  updateLabelMap (): void
  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale
  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel>
  setAtprotoAcceptLabelers (): void
}
