type TTSession = {
  [index: string]: any
  active: boolean
  accessJwt?: string
  refreshJwt?: string
  did: string
  email?: string
  emailAuthFactor?: boolean
  emailConfirmed?: boolean
  handle: string
  status?: string

  // サービスアドレス
  __service?: string // Injected

  // PDS URL
  __pdsUrl?: string // Injected

  // アバター画像URL（ AccountList で使用）
  __avatar?: string // Injected

  // 最終ログイン日時（JWT強制削除用）
  __loggedinVersion?: number // Injected
}
