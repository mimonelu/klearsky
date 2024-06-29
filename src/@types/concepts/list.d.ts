type TTList = {
  uri: string
  cid: string
  creator: AppBskyActorDefs.ProfileView
  listItemCount?: number
  name: string
  purpose: TTListPurpose
  description?: string
  descriptionFacets?: AppBskyRichtextFacet.Main[]
  avatar?: string
  viewer?: {
    muted?: boolean;
    blocked?: string;
  }
  indexedAt: string

  // マイリスト用
  items?: Array<TTListItem>
}

type TTListPurpose =
  "app.bsky.graph.defs#modlist" |
  "app.bsky.graph.defs#curatelist" |
  "app.bsky.graph.defs#referencelist" |
  "app.bsky.graph.defs#unknownlist" // Inject

type TTListItem = {
  uri: string
  subject: AppBskyActorDefs.ProfileView
}

type TTListEditPopupProps = {
  mode?: "create" | "edit"
  display: boolean
  list?: TTList
  callback?: (list: TTList) => void
}

type TTListUserManagementPopupProps = {
  display: boolean
  user?: TTUser
}
