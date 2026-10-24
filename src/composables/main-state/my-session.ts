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
  }

  // ========== セッション状態管理 ==========

  /**
   * セッション情報の更新（一元化）
   * 全てのセッション更新はここを通る
   * @param options.switchToCurrent true の場合は更新したセッションをカレントにする（デフォルト）
   * @param options.background true の場合はユーザー操作によらない更新（トークン更新・他タブとの同期）として扱う
   * @returns JWT強制削除が発生した場合はError、それ以外はundefined
   */
  updateSession (
    newData: Partial<TTSession>,
    authType: "oauth" | "password",
    service?: string,
    options?: {
      switchToCurrent?: boolean
      background?: boolean
    }
  ): Error | undefined {
    const did = newData.did ?? this.current?.did
    if (!did) return
    const switchToCurrent = options?.switchToCurrent ?? true
    const background = options?.background ?? false

    const existing = this.sessions[did] ?? {}

    // マージ処理（authTypeは必ず引数から設定）
    const updatedSession: TTSession = {
      active: newData.active ?? existing.active ?? true,
      did,
      handle: newData.handle || existing.handle || "",
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
      this.persist(did, false, background)
      const error = Error("jwtUpdateError")
      $log("MySession.updateSession", error)
      return error
    } else if (LOGGEDIN_VERSION) {
      if (updatedSession.__loggedinVersion < LOGGEDIN_VERSION) {
        delete updatedSession.accessJwt
        delete updatedSession.refreshJwt
        this.sessions[did] = updatedSession
        this.persist(did, false, background)
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
    // ユーザー操作によらない更新では、次回起動時のアカウントを変更しない
    this.persist(did, switchToCurrent && !background, background)

    $log("MySession.updateSession", { did, authType, switchToCurrent, background })
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
    this.persist(undefined, true)

    $log("MySession.switchAccount", { did })
    return true
  }

  /**
   * アカウント削除
   */
  removeAccount (did: string): void {
    delete this.sessions[did]
    const isCurrent = this.did === did
    if (isCurrent) {
      this.did = ""
      this.current = undefined
      this.authType = "password"
    }
    this.persist(did, isCurrent)
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
    this.persist(undefined, true)
    $log("MySession.clearCurrentSession")
  }

  /**
   * カレントセッションを無効化（JWTをクリア、アカウントは残す）
   * ログアウト時に使用（再ログイン時にパスワード入力が必要になる）
   */
  invalidateCurrentSession (): void {
    const did = this.current?.did
    if (did != null) {
      // JWTをクリア（アカウント情報は残す）
      this.sessions[did] = {
        ...this.sessions[did],
        accessJwt: undefined,
        refreshJwt: undefined,
        active: false,
      }
    }
    this.did = ""
    this.current = undefined
    this.authType = "password"
    this.persist(did, true)
    $log("MySession.invalidateCurrentSession")
  }

  // ========== 永続化・復元 ==========

  /**
   * 永続化
   *
   * 他タブの変更を失わないよう、保存済みのデータを読み直して指定した DID のエントリだけを反映する
   * 読み直した他の DID のエントリはメモリにも取り込む（カレントのエントリはタブごとに保持する）
   * @param did エントリを反映する DID。メモリに無ければ削除する（省略時はエントリを変更しない）
   * @param saveCurrentDid true の場合はカレントの DID を次回起動時のアカウントとして保存する
   * @param background true の場合はユーザー操作によらない更新として扱う
   */
  private persist (did: undefined | string, saveCurrentDid: boolean, background: boolean = false): void {
    const stored = Util.loadStorage("atp")
    const sessions: { [did: string]: TTSession } = stored?.sessions ?? {}
    let currentDid: string = stored?.did ?? ""

    if (did) {
      const session = this.sessions[did]
      const storedSession = sessions[did]
      if (session == null) {
        delete sessions[did]
      } else if (!background) {
        sessions[did] = session

      // ユーザー操作によらない更新では、他タブで削除・無効化されたエントリを復活させない
      } else if (storedSession != null && storedSession.active !== false) {
        // 他タブで更新された新しいトークンは残す
        sessions[did] = Util.isNewerJwt(storedSession.refreshJwt, session.refreshJwt)
          ? {
            ...session,
            accessJwt: storedSession.accessJwt,
            refreshJwt: storedSession.refreshJwt,
          }
          : session
      }
    }

    if (saveCurrentDid) {
      currentDid = this.did
    }

    // 削除されたアカウントを次回起動時のアカウントにしない
    if (sessions[currentDid] == null) {
      currentDid = ""
    }

    Util.saveStorage("atp", {
      did: currentDid,
      sessions,
    })

    // 他タブの変更をメモリに取り込む
    for (const key in this.sessions) {
      if (key !== this.did && sessions[key] == null) {
        delete this.sessions[key]
      }
    }
    for (const key in sessions) {
      if (key !== this.did) {
        this.sessions[key] = sessions[key]
      }
    }
  }

  /**
   * 復元
   */
  restore (): void {
    const data = Util.loadStorage("atp")

    if (data) {
      this.did = data.did ?? ""
      this.sessions = data.sessions ?? {}
      this.current = this.sessions[this.did]
      this.authType = this.current?.__authType ?? "password"
    }
    $log("MySession.restore", { did: this.did, authType: this.authType })
  }
}
