type TTSession = {
  active: boolean
  accessJwt?: string
  refreshJwt?: string
  did: string
  email?: string
  emailAuthFactor?: boolean
  emailConfirmed?: boolean
  handle: string
  status?: string

  // 認証方式（存在しなければパスワード認証とみなして良い）
  __authType?: "oauth" | "password"

  // サービスアドレス（基本的に https://bsky.social ）
  __service?: string

  // PDS URL 🍄
  __pdsUrl?: string

  // アバター画像URL（ AccountList で使用）
  __avatar?: string

  // 最終ログイン日時（JWT強制削除用）
  __loggedinVersion?: number

  // didDoc
  didDoc?: {
    service?: Array<{
      serviceEndpoint?: string
    }>
  }
}
