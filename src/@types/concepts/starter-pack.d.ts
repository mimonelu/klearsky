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
  feeds?: Array<TTFeedGenerator>
  indexedAt?: string
  joinedWeekCount?: number
  joinedAllTimeCount?: number
  labels?: Array<TTLabel>
  list?: TTList
  listItemCount?: number
  listItemsSample?: Array<TIListItemsSample>
}

interface TIListItemsSample {
  subject: TTUser
  uri: string
}

interface TIStarterPackEditPopupProps {
  display: boolean
  mode?: "create" | "edit"
  starterPack?: TIStarterPack
}
