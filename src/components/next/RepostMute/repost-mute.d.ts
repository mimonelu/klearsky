// リポストミュート対象ユーザー
interface TIRepostMuteSubject {
  did: string
  createdAt: string
}

// リポストミュートレコード
interface TIRepostMutesRecord {
  $type: OWN_DOMAIN_REPOST_MUTES
  subjects: Array<TIRepostMuteSubject>
  createdAt: string
}
