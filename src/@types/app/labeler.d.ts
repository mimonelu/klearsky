interface TILabelSetting {
  did: string
  definition: TILabelerDefinition
  isBadge: boolean
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
  adultOnly?: boolean
  blurs: TTLabelBlurs
  defaultSetting: TTContentVisibility
  identifier: string
  locales: Array<TILabelerDefinitionLocale>
  severity: "inform" | "alert" | "none"
}

type TTLabelBlurs = "content" | "media" | "none"

interface TILabelerDefinitionLocale {
  description: string
  lang: string
  name: string
}
