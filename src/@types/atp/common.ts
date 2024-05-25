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
