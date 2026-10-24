# Klearsky OAuth 実装ガイド

> 作成日: 2026-05-14  
> 対象ブランチ: release/v0.10.8

---

## 全体構成

```
OAuthフロー全体:
  LoginForm.vue (UI)
    → useMainViewAuth.ts  oauthLogin(handle)
      → AtpWrapper.oauthClient.signIn(handle)   # Bluesky認証画面へリダイレクト
                                                 # ← コールバックで戻る
    → useMainViewAuth.ts  autoLogin()
      → AtpWrapper.initOAuth(targetDid?)         # init-oauth.ts
        → BrowserOAuthClient.initCallback()      # コールバック処理
        or BrowserOAuthClient.restore(did)       # 特定DID復元
        or BrowserOAuthClient.initRestore()      # 前回セッション復元
        → AtpWrapper.createAgentWithOAuth()      # create-agent-with-oauth.ts
        → com.atproto.server.getSession()        # handle/email取得
        → TTSession { __authType: "oauth" }      # 返却
      → MySession.updateSession(session, "oauth")
```

---

## ファイル一覧と役割

| ファイル | 役割 |
|---------|------|
| `session/init-oauth.ts` | OAuthクライアント初期化・セッション取得のメインエントリ |
| `create/create-agent-with-oauth.ts` | OAuthSessionから`Agent`インスタンスを生成 |
| `create/create-agent-with-password.ts` | パスワード認証の`AtpAgent`を生成。`persistSession`でトークンを保存・共有 |
| `session/fetch-wrapper.ts` | atproto-proxyヘッダー付与（OAuth時はapp.bskyをスキップ） |
| `session/update-jwt.ts` | JWT更新（OAuth時はスキップ） |
| `session/sync-session.ts` | 他タブで更新されたセッションの反映 |
| `delete/delete-session.ts` | セッション削除（OAuth時は`oauthClient.revoke()`） |
| `composables/main-state/my-session.ts` | セッション状態管理・永続化 |
| `composables/main-view/useMainViewAuth.ts` | ログインフロー制御 |
| `components/next/Login/LoginForm.vue` | ログインUI（oauthLogin / passwordLogin / signUp） |
| `public/client-metadata.json` | 本番用クライアントメタデータ |
| `public/client-metadata-staging.json` | ステージング用クライアントメタデータ |
| `@types/concepts/session.d.ts` | TTSession型定義 |
| `@types/atp-wrapper.d.ts` | AtpWrapper型定義 |

---

## 初期化（init-oauth.ts）

### クライアントメタデータの動的生成

環境によって `client_id` と `redirect_uri` を切り替える：

| 環境 | client_id | redirect_uri |
|------|-----------|--------------|
| localhost | `http://localhost?redirect_uri=...&scope=...` | `http://127.0.0.1:{port}/` |
| staging | `https://staging.klearsky.pages.dev/client-metadata-staging.json` | `https://staging.klearsky.pages.dev/` |
| 本番 | `https://klearsky.pages.dev/client-metadata.json` | `https://klearsky.pages.dev/` |

共通設定：
- `scope`: `atproto transition:email transition:generic transition:chat.bsky`
- `token_endpoint_auth_method`: `none`（パブリッククライアント）
- `dpop_bound_access_tokens`: `true`
- `handleResolver`: `https://bsky.social`（ハードコード）
- `responseMode`: `query`

### セッション取得の3パターン

```typescript
// 1. OAuthコールバック（URL に ?code= がある場合）
session = await oauthClient.initCallback(callbackParams)

// 2. 特定DIDのセッション復元
session = await oauthClient.restore(targetDid)

// 3. 前回セッションの復元（DID指定なし）
session = await oauthClient.initRestore()
```

セッション取得後は `com.atproto.server.getSession()` を呼び出して handle / email を補完し、`TTSession { __authType: "oauth" }` を返す。

---

## セッション状態管理（MySession）

### TTSession の構造（OAuth時）

```typescript
{
  active: true,
  did: "did:plc:...",
  handle: "user.bsky.social",
  email: "...",
  emailConfirmed: true,
  emailAuthFactor: false,
  __authType: "oauth",          // ← OAuth判定に使用
  __service: "https://bsky.social",
  // accessJwt / refreshJwt は存在しない（BrowserOAuthClientが管理）
}
```

### 永続化の仕組み

`Util.saveStorage("atp", { did, sessions })` で localStorage に保存。  
OAuth トークン（DPoP キー、アクセストークン等）は `BrowserOAuthClient` が内部で IndexedDB に管理するため、Klearsky 側では保存・復元しない。

#### 複数タブでの保存（`MySession.persist()`）

localStorage はタブ間で共有されるが、メモリ上の `sessions` はタブを開いた時点のもの。丸ごと書き込むと他タブでの追加・削除・ログアウト・トークン更新を巻き戻すため、次のようにしている。

- 保存済みのデータを読み直し、変更した DID のエントリだけを反映する。読み直した他の DID のエントリはメモリにも取り込む
- メモリ上の `did` / `current` はそのタブで使用中のアカウントで、`atp.data.did` として「自分」の判定に使われる。他タブの変更で書き換えない
- localStorage の `did` は次回起動時のアカウント。ユーザー操作（ログイン・切り替え・ログアウト等）の時だけ書き込む
- ユーザー操作によらない更新（`updateSession` の `background`。トークン更新・`expired` 時の復旧・`syncSession`）は裏で頻繁に起きるため、次のようにする
  - localStorage の `did` を書き込まない
  - 他タブで削除・無効化（`active: false`）されたエントリを復活させない
  - 保存済みのトークンの方が新しければ（`Util.isNewerJwt`）それを残す

### 認証方式の判定

`MySession.authType` で判定。`"oauth"` か `"password"` のみ。デフォルトは `"password"`。  
復元時は `session.__authType ?? "password"` で決定。

---

## 認証フローの制御（useMainViewAuth.ts）

### autoLogin() の優先順位

1. URL に `?code=` がある → OAuth コールバック処理
2. `mySession.authType === "oauth"` → OAuthセッション復元
3. `atp.hasLogin()` → パスワード認証済み（ログイン不要）
4. `atp.canLogin()` → 保存済みJWTでパスワード認証
5. それ以外 → LoginPopup 表示

### oauthLogin(handle)

```typescript
async function oauthLogin(handle: string) {
  if (state.atp.oauthClient == null) {
    await state.atp.initOAuth()  // oauthClientだけ初期化
  }
  await state.atp.oauthClient!.signIn(handle, { signal: ... })
  // → Bluesky認証画面にリダイレクト（以降のコードは実行されない）
}
```

エラー処理：`"Failed to resolve identity"` → ローカライズエラー `oauthResolveIdentityError`

---

## fetch-wrapper.ts の挙動

```
OAuth認証時:
  app.bsky.* → atproto-proxy ヘッダーをスキップ（OAuth Agentが直接PDSにアクセス）
  chat.bsky.* → atproto-proxy ヘッダーを付与（常に）

パスワード認証時:
  app.bsky.* → atproto-proxy ヘッダーを付与
  chat.bsky.* → atproto-proxy ヘッダーを付与
```

Preferences API は、カスタム AppView を使っている場合でも公式 AppView（`OFFICIAL_ATPROTO_PROXY_APP_BSKY`）を使う。

---

## JWT更新の扱い

`update-jwt.ts` は OAuth 時は即 `return`（何もしない）。  
`BrowserOAuthClient` がトークンの期限切れを自動検出・自動リフレッシュする。  
`setupUpdateJwtInterval()` は引き続き動くが、実質 no-op。

### OAuth セッションの失効

トークン更新の失敗や失効で `BrowserOAuthClient` がセッションを削除すると `deleted` イベントが発行される。`initOAuth()` はセッション確立後にこれを監視し、カレントアカウントの DID であれば `onSessionExpired` で再ログインを促す（パスワード認証の `expired` と同じ導線）。

- 自タブでのログアウト（`revoke()`）は `cause` が `TokenRevokedError` になるので除外する
- 他タブからのイベントは BroadcastChannel 経由で届き、`cause` の型が失われる。他タブで同じアカウントをログアウトした場合も再ログインを促す対象になる
- 削除後も API 呼び出しのたびに `deleted`（"deleted by another process"）が発行されるため、通知は一度だけ行う
- 自動ログイン時の復元失敗は `initOAuth()` の呼び出し元が処理する（リスナーは復元成功後に登録する）

### 自動ログイン時の復元失敗

`initOAuth()` は復元に失敗した原因でこの 2 つを区別して返す。

- `TokenRefreshError` / `TokenRevokedError` / `TokenInvalidError`: セッションは `BrowserOAuthClient` のストアから削除済み。`Error` を返し、`tryOAuthAutoLogin()` がカレントセッションを無効化して再ログインを促す
  - 無効化しないとカレントのまま残り、リロードやアカウント選択のたびに復元に失敗し続ける（他タブで同じアカウントをログアウトした場合などに起きる）
- それ以外（ネットワークエラー等）: セッションが残っているため `undefined` を返し、状態を保持して再接続後のリロードで復元できるようにする

### パスワード認証

トークンは `CredentialSession`（`create-agent-with-password.ts`）だけが保持・更新する。更新結果は `persistSession` で `MySession` に保存し、`create` / `update` 時はワーカー経由で他タブへ共有する。

- 自前で `refreshSession` API を呼んで `MySession` だけを更新しないこと。エージェントが古い refreshJwt を持ち続け、使用済みのトークンで更新を試みることになる
  - PDS は使用済み refreshJwt の再利用を最初の使用から 2 時間だけ許容する（accessJwt の寿命も 2 時間）。普段はこれで動いてしまうが、スリープ等で 2 時間を超えるとエージェントのセッションが失効する
- `updateJwt` は accessJwt の期限 5 分前にエージェントの `sessionManager.refreshSession()` を呼ぶ。期限切れ後の自動更新に任せると、ストリームを body に持つリクエストが再送されないため
- 自動ログインでは `resumeSession` が必ずトークンを更新するため、事前に `updateJwt` しない
- 他タブから受け取ったセッションは `syncSession` でエージェントにも反映する
  - 手元より古いトークン（JWT の `iat` で比較）は反映しない。ワーカーのキャッシュは localStorage より古いことがある
  - 未ログイン時と更新中はエージェントを差し替えない（`resumeSession` / `refreshSession` と競合するため）
- `persistSession` の `expired`（refreshJwt の失効）では、他タブが localStorage に保存した新しいトークンがあればそれで再開する。なければ利用中の失効に限り `onSessionExpired` で再ログインを促す（自動ログイン時の失敗は `login()` の呼び出し元が処理する）

---

## ログアウト・セッション削除

### MySession.deleteSession()

```typescript
// OAuth の場合
await oauthClient.revoke(this.current.did)

// パスワードの場合
await agent.com.atproto.server.deleteSession(undefined, {
  headers: { authorization: `Bearer ${refreshJwt}` }
})
```

`oauthClient.revoke()` が `"deleted by another process"` エラーを返した場合は無視。

---

## マルチアカウント

- OAuth / パスワード混在可能
- `MySession.sessions` に DID をキーとして全セッションを保存
- `switchAccount(did)` で切り替え（その後 `initOAuth(did)` や `login()` を再実行）
- OAuth トークンは `BrowserOAuthClient` の内部ストア（IndexedDB）で DID ごとに管理

---

## 既知の設計上のポイント

- `BrowserOAuthClient` インスタンスは `AtpWrapper.oauthClient` に保持
- `Agent` は `AtpAgent` の親クラス。`new Agent(oauthSession) as AtpAgent` でキャスト
- `__authType` は `TTSession` に永続化されるため、再起動後も復元できる
- `handleResolver` が `https://bsky.social` ハードコードのため、サードパーティ PDS ユーザーの handle 解決は bsky.social 経由
