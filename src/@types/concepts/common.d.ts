type TTCidUri = {
  uri: string
  cid: string
  [k: string]: unknown
}

interface TICommonRecord {
  uri: string
  cid: string
  value: { [k: string]: any }
}

type TTDirection = "new" | "old" | "middle"

type TTOption = {
  label: string
  value: any
  description?: string
  classes?: string
  icon?: string
}

type TTTranslationStep = "none" | "ignore" | "waiting" | "done" | "failed"

type TTCreateReportParams = {
  reasonType: string
  reason: string
  atprotoLabeler?: string
  did?: string
  cid?: string
  uri?: string
  type?: string
}
