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

type TIFetchListsWithMembershipResponse = Promise<Error | {
  cursor?: string

  // 自身が所有するリスト配列
  // NOTE: 検索対象ユーザーとは無関係
  // NOTE: リファレンスリストは含まれない
  lists: TTList[]

  // 検索対象ユーザーに関する情報
  actors: {
    listUri: string
    listItemUri: string
  }[]
}>
