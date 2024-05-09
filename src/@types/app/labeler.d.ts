interface TILabelerLabel {
  id: string
  description?: string
  did: string
  name: string
}

interface TILabeler {
  $type: string
  uri: string
  cid: string
  creator: TTProfile
  likeCount: number
  viewer: TTUserViewer
  indexedAt: string
  labels: Array<TTLabel>
  policies: {
    description: string
    labelValueDefinitions: Array<TILabelerDifinision>
    labelValues: Array<string>
  }
}

interface TILabelerDifinision {
  adultsOnly: boolean
  blurs: string
  defaultSetting: string
  identifier: string
  locales: Array<TILabelerDifinisionLocale>
  severity: string
}

interface TILabelerDifinisionLocale {
  description: string
  lang: string
  name: string
}
