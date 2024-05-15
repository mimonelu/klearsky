interface TILabelSetting {
  did: string
  definition: TILabelerDefinition
  locale: TILabelerDefinitionLocale
  preference?: TTPreference
}

interface TILabeler {
  $type: string
  uri: string
  cid: string
  creator: TTProfile
  likeCount?: number
  viewer?: TTUserViewer
  indexedAt: string
  labels?: Array<TTLabel>
  policies: {
    description: string
    labelValueDefinitions?: Array<TILabelerDefinition>
    labelValues: Array<string>
  }
}

interface TILabelerDefinition {
  adultsOnly?: boolean
  blurs: "content" | "media" | "none"
  defaultSetting: TTContentVisibility
  identifier: string
  locales: Array<TILabelerDefinitionLocale>
  severity: "inform" | "alert" | "none"
}

interface TILabelerDefinitionLocale {
  description: string
  lang: string
  name: string
}
