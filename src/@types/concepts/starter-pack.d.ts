interface TIStarterPack {
  uri: string
  cid: string
  record: {
    $type: string
    createdAt: string
    description?: string
    descriptionFacets?: Array<any>
    feeds?: Array<{
      uri: string
    }>
    list?: string
    name: string
  }
  creator: TTUser
  listItemCount?: number
  joinedWeekCount?: number
  joinedAllTimeCount?: number
  labels?: Array<TTLabel>
  indexedAt: string
}
