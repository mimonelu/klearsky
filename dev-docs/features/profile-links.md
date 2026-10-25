# プロフィールリンク

プロフィールに表示する任意のリンク（`app.bsky.actor.link`）。deprecated になった `website` フィールドの後継（#84）。

## 構成

- `src/components/next/ProfileLink/ProfileLinkList.vue` — 一覧。`links`（`getProfile` の `profileLinkView`）で閲覧モード、`drafts`（`TTProfileLinkDraft`）で編集モード
- `src/components/next/ProfileLink/ProfileLinkEditPopup.vue` — 1 件の追加・編集・削除
- `src/composables/atp-wrapper/fetch/fetch-my-profile-links.ts` — 編集用に自分のリンクをリポジトリから直接読む
- `src/composables/atp-wrapper/update/update-profile-link-records.ts` — リンクレコードの作成・更新
- `src/composables/atp-wrapper/update/update-profile.ts` — `links` 指定時のみ、リンクレコードの書き込みからプロフィールの更新、外したレコードの削除までを行う
- `src/composables/util/fetch-profile-link-icon.ts` — favicon の取得

## 注意点

### `links` はクライアントが組み立てる

- プロフィールレコードの `links`（`strongRef` の配列、最大 10 件）が表示するリンクと順番を決める。サーバーはリンクレコードの作成・削除に連動して `links` を更新しない
- 保存は「リンクレコードの作成／更新 → プロフィールの `links` を更新 → 外したリンクのレコードを削除」の順。プロフィールは既存のレコードしか参照できないため
- 変更のないリンクは既存の参照を使い回す。並べ替えのみならレコードは書き換えない
- プロフィール更新は既存レコードを土台にし、Klearsky が扱わないフィールド（`links` `joinedViaStarterPack` `createdAt` `website` 等）を引き継ぐ。以前は丸ごと作り直しており、公式クライアントで設定したリンクが消えていた
- 編集画面では、リンクを変更した時だけ `links` を渡す。読み込みに失敗した場合も渡さない（未読み込みのまま保存して既存のリンクを消さないため）

### 死にレコード

- プロフィールから参照されていないリンクレコードは表示されない。削除の失敗や、プロフィール更新の失敗（リンクレコードは作成済み）で残りうる。いずれもエラーにはしない（公式クライアントと同様）
- そのため編集用の読み込みは `listRecords` ではなく、`links` の参照ごとに `getRecord` で取得する（公式クライアントと同様）。`listRecords` だと死にレコードも返り、溜まると 100 件単位のページ送りが必要になる

### 編集用の読み込みはリポジトリから

- `profileLinkView` の `icon` は CDN の URL のみで blob がなく、そのまま保存し直せない
- 保存済みの favicon の表示には `https://cdn.bsky.app/img/avatar_thumbnail/plain/{did}/{cid}@png` を使う

### favicon とタイトルの候補

- favicon は cardyb（`https://cardyb.bsky.app/v1/favicon?url=...&fresh=true`、最大 64px の PNG）から取得する。公式クライアントと同じ
- アップロードは保存時に行う（公式クライアントは URL 入力時）。編集を破棄しても PDS に不要な blob を残さないため
- blob はレコードから参照されるまで CDN で配信されないため、未保存の favicon は data URL で表示する
- ポップアップでは URL 欄の blur 時に favicon とページタイトルを取得し、タイトルが空か自動入力のままなら候補を入れる。候補は区切り文字より前の部分を 30 文字まで（公式クライアントと同様）。取得中はローダーで入力を止め、自動入力とユーザー入力の競合を防ぐ

### 表示

- ラベル設定で非表示またはぼかし対象のリンクは表示しない。リンクにはぼかしを表示できないため（公式クライアントと同様）
- 重複・短縮 URL・http リンクの除外は AppView に任せる
- 公式クライアントのホバー／長押しでの URL 表示は実装しない。ブラウザ標準のステータスバー・`title` 属性・長押しメニューで確認できるため
- URL は https のみ受け付け、スキームがなければ `https://` を補う。保存する URL は入力値のまま（`URL.href` は末尾に `/` を補うなど変わるため）

### 並べ替え

- `DraggableList.vue`（HTML5 の D&D）を使う。ドロップ先の前に挿入される
- `grid-gap` の隙間ではドロップできないため、編集モードでは各項目の余白で隙間を作る
