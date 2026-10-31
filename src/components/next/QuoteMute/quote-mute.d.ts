// 引用リポストミュート対象ユーザー
interface TIQuoteMuteSubject {
  did: string
  createdAt: string
}

// 引用リポストミュートレコード
interface TIQuoteMutesRecord {
  $type: OWN_DOMAIN_QUOTE_MUTES
  subjects: Array<TIQuoteMuteSubject>
  createdAt: string
}
