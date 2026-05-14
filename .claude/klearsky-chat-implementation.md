# チャット実装（リファクタ済み）

## ファイル構成

### atp-wrapper（APIラッパー）
- `chat/fetch-chat-logs.ts` — `getLog` ラッパー。`{ logs, cursor }` を返す
- `chat/fetch-chat-convo-by-dids.ts` — `getConvoForMembers`（DID配列でconvo取得）
- `chat/fetch-chat-convo-by-id.ts` — `getConvo`（convoId単体でconvo取得）
- `chat/fetch-chat-convos.ts` — `listConvos`（会話一覧取得）
- `chat/fetch-chat-messages.ts` — `getMessages`（メッセージ一覧取得）

### 状態管理
- `main-state/my-chat.ts` — `MyChat` クラス。全会話管理
- `main-state/my-convo.ts` — `MyConvo` クラス。個別会話管理

### UI
- `components/next/Chat/ChatConvoPopup.vue` — チャット会話ポップアップ（5秒ポーリング）
- `components/next/Chat/ChatListPopup.vue` — チャット一覧ポップアップ

---

## 監視アーキテクチャ

```
chatListTimer（setInterval, 60秒）         ← main-state.ts
  └─ MyChat.checkNewLogs()
      └─ getLog(logsCursor) → 変化した convoId[] を返す
          └─ convoId[] が空でなければ MyChat.updateConvos(convoIds)
              └─ convoId ごとに fetchChatConvoById → updateMyConvo

ChatConvoPopup（setTimeout 再帰, 5秒）
  └─ MyConvo.checkNewMessages()
      └─ getLog(logsCursor) → 現在の convoId に一致するログがあれば true
          └─ true なら段階的 getMessages（3 → 10 → 30件）
```

---

## カーソル管理

### MyChat
| フィールド | 用途 |
|---|---|
| `logsCursor` | `getLog` の差分取得カーソル（全会話監視用） |

- `updateDisabled()` の初回 `getLog` 呼び出し時に `logsCursor` を初期化
- `checkNewLogs()` が `string[]`（変化した convoId 一覧）を返す

### MyConvo
| フィールド | 用途 |
|---|---|
| `logsCursor` | `getLog` の差分取得カーソル（現在の会話監視用） |
| `messagesCursor` | `getMessages` の後方ページネーション（過去メッセージ遡り用） |

- `MyChat.logsCursor` と `MyConvo.logsCursor` は独立して管理（共有するとどちらかが cursor を先に進めて他方が取りこぼす）

---

## 設計判断

### なぜ getLog を使うか
- `listConvos` のページネーション cursor は「次ページ取得用」であり新着検知に使うのは意味的に誤り（旧実装の問題）
- `getLog` は cursor ベースの差分取得 API。前回以降のイベントのみ返す

### ChatConvoPopup の getLog と既読の関係
- `updateRead` を呼ぶまでサーバーが同じ LogCreateMessage を返し続ける場合がある
- その場合 `checkNewMessages()` が true を返し続け段階的取得が走るが、`updateMessages` が重複 ID を除外するため実害は軽微
- 新着なし時は `getMessages` をスキップできる点で現状より改善

### updateConvos の役割変更
- 旧: `listConvos(limit=1)` を呼んでページネーション cursor を返す（ポーリング判定に誤用）
- 新: `convoId[]` を受け取り `fetchChatConvoById` で差分のみ更新

### chatListTimer と ChatConvoPopup の棲み分け
- `chatListTimer`（60秒）: **全会話**の新着検知。即時性は不要
- `ChatConvoPopup`（5秒）: **現在開いている会話**のメッセージ更新。即時性が必要
- 両者は独立して動作し、対象が異なるため干渉しない
