# AT Protocol OAuth 実装ガイド

> 調査日: 2026-05-14  
> ソース: atproto.com, docs.bsky.app, RFC 9449, RFC 9126

---

## 概要

AT Protocol の OAuth は **Authorization Code Flow + PKCE + DPoP** の組み合わせ。クライアント登録不要で、公開メタデータ（client_metadata.json）をホストするだけでよい。

---

## 認証フロー（全7ステップ）

```
1. Handle/DID 入力 → PDS の場所を解決
2. PAR（Pushed Authorization Request）
   → PKCE チャレンジ・DPoP キーを生成して PAR エンドポイントに POST
   ← request_uri を取得
3. ブラウザで Authorization Server にリダイレクト（ユーザー認証）
4. ユーザーがスコープを承認
5. redirect_uri に code が返ってくる
6. Token Endpoint で code + PKCE 検証値 + DPoP JWT を送信
   ← access_token, refresh_token, sub（DID）を取得
7. sub の DID 検証（必須）、Authorization Server の issuer 検証
```

---

## 主要エンドポイント

| エンドポイント | パス | 用途 |
|--------------|------|------|
| Authorization Server Metadata | `/.well-known/oauth-authorization-server` | 設定一式取得 |
| Resource Server Metadata | `/.well-known/oauth-protected-resource` | PDS の AS 情報取得 |
| PAR | `[AS]/pushed_authorization_request` | request_uri 取得 |
| Token | `[AS]/token` | トークン交換・リフレッシュ |

---

## DPoP（必須）

各リクエストで ES256（NIST P-256）キーペアで署名した JWT を `DPoP` ヘッダーに付与する。

```typescript
// キーペア生成（セッションごと）
const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);
```

**DPoP JWT のペイロード**:
```json
{
  "jti": "<ランダムID>",
  "htm": "POST",
  "htu": "https://example.com/token",
  "iat": 1234567890,
  "nonce": "<サーバー提供のnonce>"
}
```

- nonce はサーバーが5分ごとにローテーション
- 401 レスポンスの `DPoP-Nonce` ヘッダーから新 nonce を取得して再試行

---

## client_metadata.json（パブリッククライアント）

```json
{
  "client_id": "https://example-app.example.com/client-metadata.json",
  "client_name": "Example App",
  "client_uri": "https://example-app.example.com",
  "application_type": "web",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "redirect_uris": ["https://example-app.example.com/callback"],
  "scope": "atproto transition:generic",
  "dpop_bound_access_tokens": true
}
```

- `client_id` = このファイルの URL そのもの
- 機密クライアントは `token_endpoint_auth_method: "private_key_jwt"` + `jwks_uri` が必要

---

## スコープ

| スコープ | 内容 |
|----------|------|
| `atproto` | 必須。アカウント認証 |
| `transition:generic` | App Password 相当の全般アクセス |
| `transition:chat.bsky` | DM アクセス |
| `transition:email` | メールアドレス（2025年6月〜） |

---

## セッション管理

**有効期限**:
- Access Token: 約2時間（実装上は〜30分推奨）
- Refresh Token（public）: 最大2週間

**SDK での自動リフレッシュ**:
```typescript
// @atproto/oauth-client-browser / node はリフレッシュを自動処理
const session = await oauthClient.resumeSession(sessionString);
```

**セッションの永続化**:
```typescript
// トークンリフレッシュ時にセッション文字列が変わるため都度保存が必要
oauthClient.events.on('session-update', async (event) => {
  const str = await event.session.export();
  localStorage.setItem('oauth_session', str);
});
```

---

## セキュリティ要件

1. **PKCE 必須**（`S256` のみ、`plain` 禁止）
2. **DPoP 必須**（全トークンリクエスト）
3. **sub 検証必須**（取得した DID が期待値と一致するか確認）
4. 並行リフレッシュ禁止
5. トークンをセッションクッキーに保存しない（XSS対策）

---

## ブラウザアプリ実装例

```typescript
import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import { Agent } from '@atproto/api';

const oauthClient = new BrowserOAuthClient({
  clientId: 'https://example-app.example.com/client-metadata.json',
  handleResolver: 'https://bsky.social',
});

// 初期化（自動セッション復元）
const session = await oauthClient.init();
if (session) {
  const agent = new Agent(session);
}

// ログイン
const url = await oauthClient.authorize('user.bsky.social', {
  scope: 'atproto transition:generic',
});
window.location.href = url;

// コールバック
const session = await oauthClient.callback(new URLSearchParams(location.search));
```

---

## 使用パッケージ

| パッケージ | 用途 |
|-----------|------|
| `@atproto/oauth-client` | 共通ベース |
| `@atproto/oauth-client-browser` | ブラウザ SPA |
| `@atproto/oauth-client-node` | Node.js / Express |
| `@atproto/api` | API クライアント（Agent） |

---

## 参考リンク

- [AT Protocol OAuth 仕様](https://atproto.com/specs/oauth)
- [OAuth クライアント実装ガイド](https://docs.bsky.app/docs/advanced-guides/oauth-client)
- [OAuth ブログ記事](https://docs.bsky.app/blog/oauth-atproto)
- [OAuth Tutorial（Next.js）](https://atproto.com/guides/oauth-tutorial)
- [GitHub: atproto/packages/oauth](https://github.com/bluesky-social/atproto/tree/main/packages/oauth)
