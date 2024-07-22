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
    } | TTFeedGenerator>
    list?: string
    name: string
  }
  creator: TTUser
  indexedAt?: string
  joinedWeekCount?: number
  joinedAllTimeCount?: number
  labels?: Array<TTLabel>
  list?: TTList
  listItemCount?: number
  listItemsSample?: Array<{
    subject: TTUser
    uri: string
  }>
}
