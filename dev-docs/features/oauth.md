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
| `session/fetch-wrapper.ts` | atproto-proxyヘッダー付与（OAuth時はapp.bskyをスキップ） |
| `session/update-jwt.ts` | JWT更新（OAuth時はスキップ） |
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
