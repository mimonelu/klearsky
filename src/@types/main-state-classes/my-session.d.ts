interface TIMySession {
  mainState: MainState

  // 全セッション（マルチアカウント）
  sessions: { [did: string]: TTSession }

  // 現在のセッション（activeなもの）
  current?: TTSession

  // 現在のDID
  did: string

  // 認証方式（現在のセッション）
  authType: "oauth" | "password"

  // セッション状態管理
  updateSession: (
    newData: Partial<TTSession>,
    authType: "oauth" | "password",
    service?: string,
    switchToCurrent?: boolean
  ) => Error | undefined
  switchAccount: (did: string) => boolean
  removeAccount: (did: string) => void

  // クリーンアップ
  deleteSession: () => Promise<Error | undefined>
  logout: () => void
  clearCurrentSession: () => void
  invalidateCurrentSession: () => void

  // 永続化・復元
  restore: () => void
}
