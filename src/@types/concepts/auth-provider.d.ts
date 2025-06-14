// 認証結果の型定義
interface AuthResult {
  success: boolean
  session?: TTSession
  error?: string
  requires2FA?: boolean
  authFactorToken?: string
}

// ログインパラメータ
interface LoginParams {
  identifier: string
  password: string
  service?: string
  authFactorToken?: string
}

// サインアップパラメータ
interface SignUpParams {
  email: string
  handle: string
  password: string
  inviteCode?: string
  verificationCode?: string
  verificationPhone?: string
  service?: string
  authFactorToken?: string
}

// セッション更新結果
interface SessionRefreshResult {
  success: boolean
  session?: TTSession
  error?: string
}

// 認証プロバイダーのベースインターフェース
interface IAuthProvider {
  // 基本認証操作
  login (params: LoginParams): Promise<AuthResult>
  logout (): Promise<void>
  signUp (params: SignUpParams): Promise<AuthResult>

  // セッション管理
  getCurrentSession (): TTSession | null
  refreshSession (): Promise<SessionRefreshResult>
  resumeSession (): Promise<AuthResult>
  resetSession (): Promise<void>
  isAuthenticated (): boolean
  canLogin (): boolean

  // JWT管理
  updateJwt (): Promise<{ success: boolean; error?: string }>

  // サーバー管理
  setService (service: string, pdsUrl?: string): void
  getService (): string | undefined
  getPdsUrl (): string | undefined

  // AtpAgent管理
  getAgent (): AtpAgent | null
  createAgent (service?: string, pdsUrl?: string): Promise<AtpAgent>

  // イベントハンドラ
  onSessionUpdated?: (session: TTSession | null) => void
  onAuthError?: (error: string) => void
}

// Bluesky特有の認証プロバイダーインターフェース
interface IBlueskyAuthProvider extends IAuthProvider {
  // Bluesky特有の機能
  handleInviteCode (code: string): Promise<boolean>
  validateHandle (handle: string): Promise<boolean>

  // PDS関連
  resolvePdsUrl (identifier: string): Promise<string | null>

  // 2FA関連
  handle2FA (authFactorToken: string): Promise<AuthResult>
  is2FARequired (): boolean
  has2FAEnabled (): boolean
}

// セッションストレージインターフェース
interface ISessionStorage {
  loadSessions (): Record<string, TTSession>
  saveSession (did: string, session: TTSession): void
  removeSession (did: string): void
  clearAllSessions (): void
  getCurrentDid (): string | null
  setCurrentDid (did: string | null): void
}
