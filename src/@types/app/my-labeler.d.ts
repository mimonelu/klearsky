interface TIMyLabeler {
  mainState: MainState
  labelers: Array<TILabeler>
  labelMap: { [did: string]: TILabelerLabel }
  subscribe (did: string, labeler: TILabeler): boolean
  unsubscribe (did: string): boolean
  isSubscribed (did?: string): boolean
  isOfficial (did?: string): boolean
  belowMyLabelerLimit (): boolean
  getMyLabelerPreferences (): Array<{ did: string }>
  makeMyLabelerPreferenceDids (): string[]
  async fetchLabeler (did: string): Promise<undefined | TILabeler>
  async updateCurrentLabeler (did: string): Promise<boolean>
  async updateMyLabelers(): Promise<boolean>
  updateLabelMap (): void
  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale
  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel>
  getLabelPreference (did: string, label: string): undefined | TTPreference
  addLabelPreference (did: string, label: string, visibility: TTContentVisibility)
  cleanLabelPreferences (): void
  setAtprotoAcceptLabelers (): void
}
