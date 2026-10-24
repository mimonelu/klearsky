# 古いレスポンスの破棄（世代番号）

画面の状態（`state.currentProfile`, `state.currentPosts` 等）は全対象で共用の 1 枠しかなく、遷移しても進行中のリクエストは中断されない。対策なしでは、前の対象へのレスポンスが後から届いて現在の状態を上書き・汚染する（#57, #71）。

## 仕組み

- `src/composables/util/create-generation.ts` — 世代番号のファクトリー（`Util.createGeneration()`）。`next()` / `current()` / `isCurrent()` を持つ
- `src/composables/main-state/generations.ts` — 用途ごとのインスタンスの集約

```ts
const generation = Generations.profile.current() // 開始時に控える
const response = await state.atp.fetchXxx(...)
if (!Generations.profile.isCurrent(generation)) {
  return // 対象が切り替わっていたら反映しない
}
```

| インスタンス | 進める場所 | 対象 |
|---|---|---|
| `navigation` | `beforeEach`（毎遷移） | `processPage()` による `listLoaderDisplay` の更新（下記「読み込み状態の所有者」） |
| `profile` | `resetProfileState()`（`beforeEach` で別プロフィールと判定された時） | プロフィール本体・各タブの一覧・固定ポスト・ハンドル履歴・ラベラー等 |
| `postThread` | `beforeEach`（毎遷移） | `fetchPostThread()` |
| `list` | `updateCurrentList()`（URL のリストが `currentList` と異なる時） | `fetchCurrentList()` / `fetchCurrentListFeeds()` / `fetchCurrentListItems()` |
| `starterPack` | `updateCurrentStarterPack()`（URL のスターターパックが `currentStarterPack` と異なる時） | スターターパック本体・`fetchCurrentStarterPackListFeeds()` |

ユーザーポップアップ（リポスト／いいね／引用リポスト）は世代番号を使わず、await 後に `currentXxxUri` が開始時と一致するかを比較する。

## 注意点

### 世代を進める場所は 1 か所に限る

- 対象が切り替わる瞬間（URL の識別子と状態のリセットが同期的に変わる場所）でのみ進める
- 再取得系の関数（`fetchCurrentProfile()` 等）で進めてはいけない。プロフィール編集後の再取得で、同一プロフィールの進行中の取得（無限スクロール等）まで破棄してしまう
- 同一対象内の移動（`profile-feeds` → `profile-like`、プロフィール → タイムライン → 同じプロフィール）では進まない。進行中のレスポンスも有効に使える

### 世代は「取得の意図が生まれた時点」で控える

- 待機を挟んでから取得する呼び出し元（`ProfileView.vue` / `EditProfileView.vue` の `Util.wait()` 後の `fetchCurrentProfile()`、`StarterPackEditPopup.vue` の作成後の追加）は、待機前に控えて引数で渡す
- 関数内で控えると、待機中の遷移後に遷移先の世代を控えてしまい、照合をすり抜ける
- `currentQuery` から識別子を読む取得関数は、識別子と世代を同時に控えればよい（`beforeEach` で両者が同時に変わるため）

### await のたびに照合する

- 後続の非同期処理（固定ポスト・ハンドル履歴等）にも世代を渡し、それぞれの await 後に照合する
- エラー時の代入（`state.currentProfile = null` 等）やエラーポップアップも照合の対象
- 呼び出し元の処理フロー（`processProfilePage()` / `updateCurrentList()` / `updateCurrentStarterPack()` → `processPage()`）も、await 後に世代が変わっていたら打ち切る

### 取得処理は `onMounted` ではなく `processPage()` に置く

- `HomeView` の `RouterView` は同一ルートのクエリ変更でコンポーネントを再生成しないため、`onMounted` での取得は同一ルート内の遷移（スターターパック画面から別のスターターパックへ、バック・フォワード）で再実行されない
- `processPage()` は `afterEach` で毎回呼ばれる。スターターパック画面の取得はこのため `StarterPackView.vue` から `updateCurrentStarterPack()` に移した

### 配列リセットは差し替えを基本とする（多層防御）

- `resetProfileState()` は `splice(0)` ではなく新しい配列に差し替える。atp-wrapper は await 前に受け取った配列に書き込むため、照合が漏れても古いレスポンスは捨てられた配列に入るだけになる
- ただし世代を進めない場所での差し替えは不可。`fetchCurrentProfile()` 内のリセットは `splice(0)` のまま。差し替えると同一プロフィールの進行中の取得が捨てられた配列に入る一方、カーソルだけ保存されて食い違う
- カーソル等のスカラー値は差し替えで守れないため、照合は常に必要

### 識別子の比較ではなく世代番号を使う理由

- プロフィールの `account` はハンドルと DID の表記揺れがあり、編集画面（`/profile/edit`）では空になる
- 述語関数で `state.currentList` 等の状態と比較すると、比較対象の状態自体が汚染された時に素通りする（#72）
- 対象の識別子が正規で表記揺れのない場合（ユーザーポップアップの uri 等）は、識別子の比較で十分

### 読み込み状態の所有者（#75）

読み込み状態も、取得を始めた側だけが書き込む。共有のフラグを複数の処理が `true` / `false` すると、先に終わった古い処理が現在の処理の読み込み中に `false` にしてしまう。

- 初回の読み込み（`state.listLoaderDisplay`）: `processPage()` だけが書き込む。`beforeEach` で `Generations.navigation` を進めて `false` に戻し、`processPage()` は自分の世代が最新の場合のみ `false` に戻す
- 追加読み込み（ロードボタン・スクロール）: 各コンポーネントのローカルな `state.processing`。コンポーネントは遷移で破棄されるため、ページをまたいで干渉しない
- 参照側は両者の OR（各コンポーネントの `listLoading`）で、ローダー表示・空表示の抑制・追加読み込みの排他を判定する
- `centerLoaderDisplay` はミュート等の多重実行防止のロックも兼ねるため、遷移に紐づく読み込みには使わない（スターターパック画面は `listLoaderDisplay` と `currentStarterPack` で表示する）

残る問題（既存の挙動）:

- #76 初回取得中に同一プロフィールの別タブへ移ってすぐ戻ると、一覧がまだ 0 件のため新着取得が再度走る。データ枠ごとの読み込み状態が必要で、スコープオブジェクト化（下記）で扱う
- 同一ルート内のクエリ変更ではコンポーネントが再生成されないため、前の対象の追加読み込みが終わるまでスクロール読み込みが止まる
- フォロー中・フォロワー一覧の空表示は親ビューにあり、`UserBoxList` の追加読み込み中を参照しない（追加読み込みは一覧が空でない時に起きるため実害なし）

## 採らなかった案

- 関数ごとの latest-wins: 呼ばれない関数の古いレスポンスを無効化できず、同一対象で新着と過去分の取得が並行すると正しいレスポンスを捨てる
- 遷移の直列化: バック・フォワードは止められない
- DID をキーにしたキャッシュ: メモリ管理・鮮度・ハンドル→DID 解決が必要で過剰
- 状態をスコープオブジェクトにまとめて遷移時に丸ごと差し替える: 照合漏れが無害になる点で堅牢だが、参照箇所の書き換えが大きい。`main-state.ts` 分割時の到達点
- リクエストの中断（`AbortController`）: レスポンス受信後には効かないため照合は依然必要。通信量削減の補助として #70 で検討

## 未対応・関連

- #73 検索（タブごとの世代、検索語のスナップショット）
- #74 引用リポスト一覧ポップアップで取得エラー後に追加読み込みができなくなる
