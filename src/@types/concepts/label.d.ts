// TODO: "show" が不要であれば削除すること
type TTContentVisibility = "hide" | "show" | "warn" | "ignore" | string

type TTLabel = {
  cid?: string // Only post
  cts: string // Date
  exp?: string
  neg?: boolean
  sig?: Uint8Array
  src: string // DID
  uri: string
  val: string
  ver?: number
}

type TTLabelBlurs = "content" | "media" | "none"

type TTLabelOnWarn = "null" | "blur" | "blur-media" | "alert"

interface TILabelSetting {
  did: string
  definition: TILabelerDefinition
  isBadge: boolean
  locale: TILabelerDefinitionLocale
  preference?: TTPreferenceLabel
}

interface TTLabelBehavior {
  oldGroup: string
  group: string
  configurable: boolean
  warn: TTLabelOnWarn
  selectable?: boolean
}

declare module "@/consts/label-behaviors.json" {
  const data: {
    [k: string]: TTLabelBehavior
  };
  export default data;
}
