interface TIMyLabeler {
  mainState: MainState
  labelers: Array<TILabeler>
  labelMap: { [did: string]: TILabelSetting }
  subscribe (did: string, labeler: TILabeler): boolean
  unsubscribe (did: string): boolean
  isSubscribed (did?: string): boolean
  isOfficial (did?: string): boolean
  belowMyLabelerLimit (): boolean
  getMyLabelerPreferences (): Array<{ did: string }>
  makeMyLabelerPreferenceDids (): string[]
  fetchLabeler (did: string): Promise<undefined | TILabeler>
  updateCurrentLabeler (did: string): Promise<boolean>
  updateMyLabelers(): Promise<boolean>
  updateLabelMap (): void
  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale
  getSpecificLabels (labels: Array<TTLabel>, visibility: Array<TTContentVisibility>, blurs: Array<TTLabelBlurs>): Array<TILabelSetting>
  getLabelPreference (did: string, label: string): undefined | TTPreferenceLabel
  addLabelPreference (did: string, label: string, visibility: TTContentVisibility)
  cleanLabelPreferences (): void
  like (uri: string, cid: string): Promise<Error | string>
  unlike (uri: string, likeUri: string): Promise<Error | undefined>
  setAtprotoAcceptLabelers (): void
}
