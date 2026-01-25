import type { BrowserOAuthClient } from "@atproto/oauth-client-browser"
import Util from "@/composables/util"
import { LOGGEDIN_VERSION } from "@/consts/consts.json"

export default class MySession {
  public mainState: MainState

  // 現在のセッション（activeなもの）
  public current?: TTSession

  // 全セッション（マルチアカウント）
  public sessions: { [did: string]: TTSession } = {}

  // 現在のDID
  public did: string = ""

  // 認証方式（現在のセッション）
  // デフォルトは "password"（AtpWrapper.authType 廃止後の互換性のため）
  public authType: "oauth" | "password" = "password"

  constructor (mainState: MainState) {
    this.mainState = mainState

    // AtpWrapper に MySession への参照を設定
    mainState.atp.setMySession(this)

    // セッション復元
    this.restore()
  }

  // ========== セッション状態管理 ==========

  /**
   * セッション情報の更新（一元化）
   * 全てのセッション更新はここを通る
   * @param switchToCurrent true の場合は更新したセッションをカレントにする（デフォルト）
   * @returns JWT強制削除が発生した場合はError、それ以外はundefined
   */
  updateSession (
    newData: Partial<TTSession>,
    authType: "oauth" | "password",
    service?: string,
    switchToCurrent: boolean = true
  ): Error | undefined {
    const did = newData.did ?? this.current?.did
    if (!did) return

    const existing = this.sessions[did] ?? {}

    // マージ処理（authTypeは必ず引数から設定）
    const updatedSession: TTSession = {
      active: newData.active ?? existing.active ?? true,
      did,
      handle: newData.handle ?? existing.handle ?? "",
      accessJwt: newData.accessJwt ?? existing.accessJwt,
      refreshJwt: newData.refreshJwt ?? existing.refreshJwt,
      email: newData.email ?? existing.email,
      emailAuthFactor: newData.emailAuthFactor ?? existing.emailAuthFactor,
      emailConfirmed: newData.emailConfirmed ?? existing.emailConfirmed,
      status: newData.status ?? existing.status,
      __authType: authType, // ← 必ず明示的に設定
      __service: service ?? newData.__service ?? existing.__service ?? "",
      __pdsUrl: newData.__pdsUrl ?? newData.didDoc?.service?.[0]?.serviceEndpoint ?? existing.__pdsUrl,
      __avatar: newData.__avatar ?? existing.__avatar,
      __loggedinVersion: newData.__loggedinVersion ?? existing.__loggedinVersion ?? LOGGEDIN_VERSION,
    }

    // JWT強制削除（アプリバージョンアップ時に古いJWTを無効化）
    if (updatedSession.__loggedinVersion == null) {
      delete updatedSession.accessJwt
      delete updatedSession.refreshJwt
      this.sessions[did] = updatedSession
      this.persist()
      const error = Error("jwtUpdateError")
      $log("MySession.updateSession", error)
      return error
    } else if (LOGGEDIN_VERSION) {
      if (updatedSession.__loggedinVersion < LOGGEDIN_VERSION) {
        delete updatedSession.accessJwt
        delete updatedSession.refreshJwt
        this.sessions[did] = updatedSession
        this.persist()
        const error = Error("jwtUpdateError")
        $log("MySession.updateSession", error)
        return error
      }
    }

    this.sessions[did] = updatedSession

    // カレントセッションを切り替える場合のみ更新
    if (switchToCurrent) {
      this.did = did
      this.current = updatedSession
      this.authType = authType
    }

    // 永続化
    this.persist()

    $log("MySession.updateSession", { did, authType, switchToCurrent })
  }

  /**
   * アクティブセッションの切り替え（マルチアカウント）
   */
  switchAccount (did: string): boolean {
    const session = this.sessions[did]
    if (!session) return false

    this.did = did
    this.current = session
    this.authType = session.__authType ?? "password"

    // 永続化
    this.persist()

    $log("MySession.switchAccount", { did })
    return true
  }

  /**
   * アカウント削除
   */
  removeAccount (did: string): void {
    delete this.sessions[did]
    if (this.did === did) {
      this.did = ""
      this.current = undefined
      this.authType = "password"
    }
    this.persist()
    $log("MySession.removeAccount", { did })
  }

  // ========== クリーンアップ ==========

  /**
   * セッション削除（認証方式に応じた処理）
   */
  async deleteSession (): Promise<Error | undefined> {
    if (!this.current) {
      return Error("noSessionError")
    }

    if (this.authType === "oauth") {
      const oauthClient = this.mainState.atp.oauthClient as BrowserOAuthClient | undefined
      if (oauthClient) {
        try {
          await oauthClient.revoke(this.current.did)
        } catch (error) {
          // セッションが既に削除されている場合は無視
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (!errorMessage.includes("deleted by another process")) {
            $warn("MySession.deleteSession (OAuth)", error)
          }
        }
      }
    } else {
      // パスワード認証の場合
      const agent = this.mainState.atp.agent
      if (agent && this.current.refreshJwt) {
        try {
          await agent.com.atproto.server.deleteSession(undefined, {
            headers: {
              authorization: `Bearer ${this.current.refreshJwt}`,
            },
          })
        } catch (error) {
          $warn("MySession.deleteSession (password)", error)
        }
      }
    }

    $log("MySession.deleteSession", { authType: this.authType })
    return undefined
  }

  /**
   * ログアウト（アカウント削除）
   */
  logout (): void {
    if (this.current) {
      this.removeAccount(this.current.did)
    }
    $log("MySession.logout")
  }

  /**
   * カレントセッションをクリア（アカウントは残す）
   * 新規ログイン時に使用
   */
  clearCurrentSession (): void {
    this.did = ""
    this.current = undefined
    this.authType = "password"
    this.persist()
    $log("MySession.clearCurrentSession")
  }

  /**
   * カレントセッションを無効化（JWTをクリア、アカウントは残す）
   * ログアウト時に使用（再ログイン時にパスワード入力が必要になる）
   */
  invalidateCurrentSession (): void {
    if (this.current) {
      // JWTをクリア（アカウント情報は残す）
      this.sessions[this.current.did] = {
        ...this.sessions[this.current.did],
        accessJwt: undefined,
        refreshJwt: undefined,
        active: false,
      }
    }
    this.did = ""
    this.current = undefined
    this.authType = "password"
    this.persist()
    $log("MySession.invalidateCurrentSession")
  }

  // ========== 永続化・復元 ==========

  /**
   * 永続化
   */
  private persist (): void {
    const data = {
      did: this.did,
      sessions: this.sessions,
    }
    // 両方のキーに保存（後方互換性）
    Util.saveStorage("mySession", data)
    Util.saveStorage("atp", data)
  }

  /**
   * 復元
   */
  restore (): void {
    // まず "mySession" キーを確認、なければ "atp" キーからマイグレーション
    let data = Util.loadStorage("mySession")
    if (!data || Object.keys(data.sessions ?? {}).length === 0) {
      const atpData = Util.loadStorage("atp")
      if (atpData && Object.keys(atpData.sessions ?? {}).length > 0) {
        data = atpData
        $log("MySession.restore: migrated from 'atp' key")
      }
    }

    if (data) {
      this.did = data.did ?? ""
      this.sessions = data.sessions ?? {}
      this.current = this.sessions[this.did]
      this.authType = this.current?.__authType ?? "password"

      // マイグレーション後は両方のキーに保存
      this.persist()
    }
    $log("MySession.restore", { did: this.did, authType: this.authType })
  }
}
