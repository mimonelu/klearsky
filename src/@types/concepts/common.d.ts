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
  classes?: string
  icon?: string
}
