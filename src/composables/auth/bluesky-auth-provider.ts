import type { AtpAgent, AtpAgentLoginOpts } from "@atproto/api"
import { LocalSessionStorage } from "@/composables/auth/session-storage"

// 認証エラーの種類
enum AuthErrorType {
  INVALID_CREDENTIALS = "invalid_credentials",
  NETWORK_ERROR = "network_error",
  SESSION_EXPIRED = "session_expired",
  TWO_FA_REQUIRED = "two_fa_required",
  INVITE_CODE_REQUIRED = "invite_code_required",
  HANDLE_NOT_AVAILABLE = "handle_not_available",
  EMAIL_NOT_CONFIRMED = "email_not_confirmed",
  ACCOUNT_SUSPENDED = "account_suspended",
  ACCOUNT_DEACTIVATED = "account_deactivated",
  SERVICE_UNAVAILABLE = "service_unavailable",
  UNKNOWN_ERROR = "unknown_error"
}

// AuthErrorクラスの実装をここに追加
class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export class BlueskyAuthProvider implements IBlueskyAuthProvider {
  private agent: AtpAgent | null = null
  private sessionStorage: ISessionStorage
  private currentSession: TTSession | null = null

  // イベントハンドラ
  onSessionUpdated?: (session: TTSession | null) => void
  onAuthError?: (error: string) => void

  constructor (sessionStorage?: ISessionStorage) {
    this.sessionStorage = sessionStorage || new LocalSessionStorage()
    this.loadCurrentSession()
  }

  // 基本認証操作
  async login (params: LoginParams): Promise<AuthResult> {
    try {
      const service = params.service || "https://bsky.social"

      // 自動ログインの場合
      if (!params.identifier || !params.password) {
        return await this.autoLogin(service)
      }

      // 手動ログインの場合
      return await this.manualLogin(params, service)
    } catch (error) {
      return this.handleAuthError(error, "login")
    }
  }

  async logout (): Promise<void> {
    try {
      if (this.currentSession) {
        // アカウント情報は削除せず、セッションを無効化するだけ
        // JWTは残しておく（再ログイン時に問題が生じる可能性があるため）
        const loggedOutSession: TTSession = {
          ...this.currentSession,
          active: false
        }
        this.sessionStorage.saveSession(this.currentSession.did, loggedOutSession)
      }

      this.currentSession = null
      this.agent = null
      this.sessionStorage.setCurrentDid(null)

      this.onSessionUpdated?.(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw new AuthError("unknown_error" as AuthErrorType, "Logout failed", error)
    }
  }

  async signUp (params: SignUpParams): Promise<AuthResult> {
    try {
      const service = params.service || "https://bsky.social"
      if (!this.agent) {
        await this.createAgent(service)
      }
      if (!this.agent) {
        throw new AuthError("service_unavailable" as AuthErrorType, "Could not create agent")
      }
      const response = await this.agent.createAccount({
        email: params.email,
        handle: params.handle,
        password: params.password,
        inviteCode: params.inviteCode,
        verificationCode: params.verificationCode,
        verificationPhone: params.verificationPhone,
      })
      if (response.success && response.data) {
        const session = this.convertAtpSessionToTTSession(response.data, service)
        this.setCurrentSession(session)
        return {
          success: true,
          session: session
        }
      }
      throw new AuthError("unknown_error" as AuthErrorType, "Sign up failed")
    } catch (error) {
      return this.handleAuthError(error, "signUp")
    }
  }

  // セッション管理
  getCurrentSession (): TTSession | null {
    return this.currentSession
  }

  async refreshSession (): Promise<SessionRefreshResult> {
    try {
      if (!this.currentSession?.refreshJwt) {
        throw new AuthError("session_expired" as AuthErrorType, "No refresh token available")
      }

      // 手動でリフレッシュリクエストを送信（既存の実装を参考）
      const service = this.currentSession.__service || "https://bsky.social"
      const response = await fetch(`${service}/xrpc/com.atproto.server.refreshSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.currentSession.refreshJwt}`
        }
      })

      if (!response.ok) {
        throw new AuthError("session_expired" as AuthErrorType, "Session refresh failed")
      }

      const data = await response.json()
      const updatedSession: TTSession = {
        ...this.currentSession,
        accessJwt: data.accessJwt,
        refreshJwt: data.refreshJwt,
        active: true
      }

      this.setCurrentSession(updatedSession)

      return {
        success: true,
        session: updatedSession
      }
    } catch (error: any) {
      // すべてのリフレッシュ失敗をセッション期限切れとして扱う
      // ネットワークエラーとセッション期限切れの確実な区別は困難のため
      return {
        success: false,
        error: "refreshJwtExpired"
      }
    }
  }

  async resumeSession (): Promise<AuthResult> {
    try {
      if (!this.currentSession) {
        throw new AuthError("session_expired" as AuthErrorType, "No session to resume")
      }

      if (!this.agent) {
        await this.createAgent(this.currentSession.__service, this.currentSession.__pdsUrl)
      }

      if (!this.agent) {
        throw new AuthError("service_unavailable" as AuthErrorType, "Could not create agent")
      }

      await this.agent.resumeSession(this.currentSession as any)

      return {
        success: true,
        session: this.currentSession
      }
    } catch (error) {
      return this.handleAuthError(error, "resumeSession")
    }
  }

  async resetSession (): Promise<void> {
    // 既存のresetSession実装を参考に実装
    if (this.currentSession && this.agent?.session) {
      const updatedSession: TTSession = {
        ...this.currentSession,
        active: this.agent.session.active,
        accessJwt: this.agent.session.accessJwt,
        refreshJwt: this.agent.session.refreshJwt,
        did: this.agent.session.did,
        email: this.agent.session.email,
        handle: this.agent.session.handle,
        __loggedinVersion: Date.now()
      }

      this.setCurrentSession(updatedSession)
    }
  }

  isAuthenticated (): boolean {
    return this.currentSession?.active === true &&
           !!this.currentSession.accessJwt
  }

  canLogin (): boolean {
    const sessions = this.sessionStorage.loadSessions()
    // 有効なセッション（activeまたはaccessJwtがある）が存在するかチェック
    return Object.values(sessions).some(session => 
      session.active === true || session.accessJwt
    )
  }

  // JWT管理
  async updateJwt (): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentSession?.accessJwt) {
        return { success: false, error: "refreshJwtExpired" }
      }

      // JWT有効期限チェック（既存の実装を参考）
      const jwtPayload = JSON.parse(atob(this.currentSession.accessJwt.split(".")[1]))
      const exp = jwtPayload.exp * 1000
      const now = Date.now()
      const margin = 10 * 60 * 1000 // 10分のマージン

      if (exp - now < margin) {
        const refreshResult = await this.refreshSession()
        if (!refreshResult.success) {
          return { success: false, error: refreshResult.error || "refreshJwtExpired" }
        }
        return { success: true }
      }

      return { success: true }
    } catch (error) {
      console.error("JWT update error:", error)
      return { success: false, error: "refreshJwtExpired" }
    }
  }

  // サーバー管理
  setService (service: string, pdsUrl?: string): void {
    if (this.currentSession) {
      this.currentSession.__service = service
      if (pdsUrl) {
        this.currentSession.__pdsUrl = pdsUrl
      }
      this.saveCurrentSession()
    }
  }

  getService (): string | undefined {
    return this.currentSession?.__service
  }

  getPdsUrl (): string | undefined {
    return this.currentSession?.__pdsUrl
  }

  // AtpAgent管理
  getAgent (): AtpAgent | null {
    return this.agent
  }

  async createAgent (service?: string, pdsUrl?: string): Promise<AtpAgent> {
    try {
      const { AtpAgent } = await import("@atproto/api")

      const agentService = service || "https://bsky.social"
      this.agent = new AtpAgent({
        service: agentService,
        persistSession: (evt, session) => {
          if (evt === "create" || evt === "update") {
            const ttSession = this.convertAtpSessionToTTSession(session, agentService, pdsUrl)
            this.setCurrentSession(ttSession)
          }
        }
      })


      return this.agent
    } catch (error) {
      console.error("[BlueskyAuthProvider.createAgent] Error:", error)
      throw error
    }
  }

  // Bluesky特有の機能
  async handleInviteCode (code: string): Promise<boolean> {
    // 招待コードの処理実装
    return true
  }

  async validateHandle (handle: string): Promise<boolean> {
    // ハンドルバリデーション実装
    return handle.length > 0 && handle.includes(".")
  }

  async resolvePdsUrl (identifier: string): Promise<string | null> {
    // PDS URL解決実装
    return null
  }

  async handle2FA (authFactorToken: string): Promise<AuthResult> {
    // 2FA処理実装
    return { success: false, error: "2FA not implemented" }
  }

  // 2FA関連のユーティリティメソッド
  is2FARequired (): boolean {
    return this.currentSession?.emailAuthFactor === true
  }

  has2FAEnabled (): boolean {
    return this.currentSession?.emailAuthFactor === true
  }

  // プライベートメソッド
  private async autoLogin (service: string): Promise<AuthResult> {
    try {
      const currentDid = this.sessionStorage.getCurrentDid()
      if (!currentDid) {
        return { success: false, error: "No current session" }
      }

      const sessions = this.sessionStorage.loadSessions()
      const session = sessions[currentDid]
      if (!session) {
        return { success: false, error: "Session not found" }
      }

      this.currentSession = session

      // Agentを作成
      if (!this.agent) {
        await this.createAgent(session.__service, session.__pdsUrl)
      }

      // JWT更新
      const jwtUpdateResult = await this.updateJwt()
      if (!jwtUpdateResult.success) {
        return { success: false, error: jwtUpdateResult.error || "refreshJwtExpired" }
      }

      // セッション復元
      const resumeResult = await this.resumeSession()
      if (!resumeResult.success) {
        throw resumeResult
      }

      // セッション情報更新
      await this.resetSession()

      return {
        success: true,
        session: this.currentSession
      }
    } catch (error) {
      console.error("AutoLogin error:", error)
      throw error
    }
  }

  private async manualLogin (params: LoginParams, service: string): Promise<AuthResult> {
    try {
      // 手動ログイン時は既存のセッション状態をクリア
      this.currentSession = null
      this.agent = null

      await this.createAgent(service)

      if (!this.agent) {
        throw new AuthError("service_unavailable" as AuthErrorType, "Could not create agent")
      }

      const loginOpts: AtpAgentLoginOpts = {
        identifier: params.identifier,
        password: params.password,
        authFactorToken: params.authFactorToken
      }

      const response = await (this.agent as any).login(loginOpts)

      if (response.success && response.data) {
        const session = this.convertAtpSessionToTTSession(response.data, service)
        this.setCurrentSession(session)
        return {
          success: true,
          session: session
        }
      }

      return { success: false, error: "Login failed" }
    } catch (error: any) {
      // 2FAエラーの特別処理
      if (error?.error === "AuthFactorTokenRequired" || 
          error?.message?.includes("AuthFactorTokenRequired") ||
          error?.message?.includes("sign in code")) {
        return { 
          success: false, 
          requires2FA: true,
          error: "Two-factor authentication required"
        }
      }

      return this.handleAuthError(error, "manualLogin")
    }
  }

  private convertAtpSessionToTTSession (
    atpSession: any,
    service: string,
    pdsUrl?: string
  ): TTSession {
    return {
      active: atpSession.active || true,
      accessJwt: atpSession.accessJwt,
      refreshJwt: atpSession.refreshJwt,
      did: atpSession.did,
      email: atpSession.email,
      emailAuthFactor: atpSession.emailAuthFactor,
      emailConfirmed: atpSession.emailConfirmed,
      handle: atpSession.handle,
      status: atpSession.status,
      __service: service,
      __pdsUrl: pdsUrl,
      __loggedinVersion: Date.now(),
      didDoc: atpSession.didDoc
    }
  }

  private setCurrentSession (session: TTSession): void {
    this.currentSession = session
    this.sessionStorage.saveSession(session.did, session)
    this.sessionStorage.setCurrentDid(session.did)
    this.onSessionUpdated?.(session)
  }

  private saveCurrentSession (): void {
    if (this.currentSession) {
      this.sessionStorage.saveSession(this.currentSession.did, this.currentSession)
    }
  }

  private loadCurrentSession (): void {
    const currentDid = this.sessionStorage.getCurrentDid()
    if (currentDid) {
      const sessions = this.sessionStorage.loadSessions()
      this.currentSession = sessions[currentDid] || null
    }
  }

  private handleAuthError (error: any, operation: string): AuthResult {
    console.error(`[BlueskyAuthProvider.${operation}]`, error)

    if (error instanceof AuthError) {
      this.onAuthError?.(error.message)
      return { success: false, error: error.message }
    }

    // AtpAgentのエラーハンドリング
    if (error?.error === "AuthFactorTokenRequired") {
      return {
        success: false,
        requires2FA: true,
        error: "Two-factor authentication required"
      }
    }

    // 一般的なエラー処理
    const errorMessage = error?.message || "Unknown authentication error"
    this.onAuthError?.(errorMessage)

    return {
      success: false,
      error: errorMessage
    }
  }
}