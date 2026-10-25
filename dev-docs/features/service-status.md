# サービスステータス（#87）

Bluesky 公式のステータスページを定期的に取得し、障害中は画面左端にアイコンを表示する。取得間隔は時間設定で変えられ、既定は 10 分ごと。「取得しない」で監視を止められる。

## 構成

| パス | 内容 |
|---|---|
| `src/composables/main-state/my-service-status.ts` | 状態・タイマー・表示条件（`state.myServiceStatus`） |
| `src/composables/util/fetch-service-status.ts` | JSON の取得 |
| `src/composables/util/sanitize-service-status.ts` | 応答を想定どおりの形に整える（型が合わない値は捨てる） |
| `src/components/next/ServiceStatus/ServiceStatusIndicator.vue` | 画面左端のアイコンとメッセージ |
| `src/components/next/ServiceStatus/ServiceStatusPopup.vue` | ステータスポップアップ（設定ポップオーバーからも開ける） |

## 取得元

- `https://status.bsky.app`（Instatus）。`bluesky.statuspage.io` は 2024-07 で更新が止まっているため使わない
- 定期取得は `summary.json` のみ。`v2/components.json` は `page.status` が `UP` 以外の時とポップアップ表示中のみ取得する（通信量を抑えるため）
- `summary.json` の `activeIncidents` は障害中しか含まれず、形式は Instatus のドキュメントの例でしか確認できていない。どのような JSON でも例外を起こさないよう、取得直後に `sanitize-service-status.ts` で整える
- PDS 単位のコンポーネントはない。PDS の障害は「Website, App, and API」等に紐付けられる

## 表示条件

- アイコン: 監視が有効で、`page.status` が `UP` 以外（メンテナンス中を含む）
- メッセージ「障害発生中」: アイコンの条件に加え、Network Infrastructure グループ（Relay・Jetstream）以外に `PARTIALOUTAGE` 以上のコンポーネントがあり、未確認のインシデントがある
  - インシデントの `impact` では判定しない。付け方が一貫しておらず、サイト全体の障害でも `PARTIALOUTAGE`、Jetstream の障害が `MAJOROUTAGE` になっている
  - `activeIncidents` には関係するコンポーネントが含まれないため、コンポーネントの状態で判定する
- ポップアップを開いたら、その時点のインシデントを確認済みにしてメッセージを隠す。識別子はドキュメントの例に `id` がないため `url` を使う。確認済みの記録はメモリのみ（再読み込みで再表示される）

## 注意点

- 取得に失敗したら前回の状態を消す。誤報でアイコンが出続けるのを避けるため
- タブが非表示の間はタイマーを止める。表示に戻った時は、前回の取得から取得間隔が経っていれば取得し、経っていなければ残り時間だけ待つ（タブを切り替えるたびに取得しないため）
- タブごとに取得する。非表示のタブでは止めるため、SharedWorker での共有はしていない
- `visibilitychange` のハンドラーは `mainState.myServiceStatus` 経由で呼ぶ。コンストラクター内の `this` はリアクティブなプロキシではないため、直接書き換えると画面が更新されない

## 実機確認

障害時の表示は、ブラウザの開発者ツールの Local Overrides で `summary.json` / `v2/components.json` の応答を書き換えて確認する。偽のデータを返す仕組みはコードに入れていない。
