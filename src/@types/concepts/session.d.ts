type TTSession = {
  [index: string]: any
  accessJwt: string
  refreshJwt: string
  did: string
  email?: string
  emailAuthFactor?: boolean
  emailConfirmed?: boolean
  handle: string

  // プロトコル付きサービスアドレス
  __service?: string // Injected

  // プロトコルなしサービスアドレス（ホスト名）
  __serviceName?: string // Injected

  // アバター画像URL（ AccountList で使用）
  __avatar?: string // Injected
}
