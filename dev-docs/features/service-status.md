# サービスステータス（#87）

Bluesky 公式のステータスページを定期的に取得し、障害中はインジケーターを表示する。取得間隔は時間設定で変えられ、既定は 10 分ごと。「取得しない」で監視を止められる。

## 構成

| パス | 内容 |
|---|---|
| `src/composables/main-state/my-service-status.ts` | 状態・タイマー・表示条件（`state.myServiceStatus`） |
| `src/composables/util/fetch-service-status.ts` | JSON の取得 |
| `src/composables/util/sanitize-service-status.ts` | 応答を想定どおりの形に整える（型が合わない値は捨てる） |
| `src/components/next/ServiceStatus/ServiceStatusIndicator.vue` | インジケーター（アイコンとメッセージ） |
| `src/components/next/ServiceStatus/ServiceStatusPopup.vue` | ステータスポップアップ（設定ポップオーバーからも開ける） |

## 取得元

- `https://status.bsky.app`（Instatus）。`bluesky.statuspage.io` は 2024-07 で更新が止まっているため使わない
- 定期取得は `summary.json` のみ。`v2/components.json` は `page.status` が `UP` 以外の時とポップアップ表示中のみ取得する（通信量を抑えるため）
- `summary.json` の `activeIncidents` は障害中しか含まれず、形式は Instatus のドキュメントの例でしか確認できていない。どのような JSON でも例外を起こさないよう、取得直後に `sanitize-service-status.ts` で整える
- PDS 単位のコンポーネントはない。PDS の障害は「Website, App, and API」等に紐付けられる

## 表示条件

- アイコン: 監視が有効で、`page.status` が `UP` 以外（メンテナンス中を含む）
- 深刻な障害（`severe`）: Network Infrastructure グループ（Relay・Jetstream）以外に `PARTIALOUTAGE` 以上のコンポーネントがある。深刻かどうかでインジケーターの表示を変える
- メッセージ「障害発生中」: アイコンの条件に加え、深刻な障害で、未確認のインシデントがある
  - インシデントの `impact` では判定しない。付け方が一貫しておらず、サイト全体の障害でも `PARTIALOUTAGE`、Jetstream の障害が `MAJOROUTAGE` になっている
  - `activeIncidents` には関係するコンポーネントが含まれないため、コンポーネントの状態で判定する
- ポップアップを開いたら、その時点のインシデントを確認済みにしてメッセージを隠す。識別子はドキュメントの例に `id` がないため `url` を使う。確認済みの記録はメモリのみ（再読み込みで再表示される）

## 注意点

- インジケーターは `main-view__main` の中に置き、`z-index: 1` にする。ルータービュー内で開くポップアップ（プロフィールリンクの編集等）も `main-view__main` の中で `z-index: 2` のため、それより下にする
- 取得に失敗したら前回の状態を消す。誤報でアイコンが出続けるのを避けるため
- タブが非表示の間はタイマーを止める。表示に戻った時は、前回の取得から取得間隔が経っていれば取得し、経っていなければ残り時間だけ待つ（タブを切り替えるたびに取得しないため）
- タブごとに取得する。非表示のタブでは止めるため、SharedWorker での共有はしていない
- `visibilitychange` のハンドラーは `mainState.myServiceStatus` 経由で呼ぶ。コンストラクター内の `this` はリアクティブなプロキシではないため、直接書き換えると画面が更新されない

## 実機確認

偽のデータを返す仕組みはコードに入れていない。障害時の表示は、次のスクリプトで `fetch` を差し替えて確認する（開発者ツールのコンソールに貼るか、1 行にして先頭に `javascript:` を付けてブックマークレットにする）。

- `summary.json` は偽の応答を返し、`v2/components.json` は実際の応答の `scenario.component` だけ状態を書き換える
- 差し替え後にステータスポップアップを開くと取得し直すので、すぐ反映される（開かなければ次の定期取得で反映される）
- 監視が「取得しない」だとインジケーターは出ない
- 元に戻すには再読み込みする
- `scenario` の例
  - 深刻な障害: `{ page: "HASISSUES", component: "Website, App, and API", status: "PARTIALOUTAGE" }`
  - 深刻でない障害: `{ page: "HASISSUES", component: "Jetstream West", status: "MAJOROUTAGE" }`
  - メンテナンス: `{ page: "UNDERMAINTENANCE", component: "Feeds", status: "UNDERMAINTENANCE" }`

```js
(() => {
  const scenario = { page: "HASISSUES", component: "Website, App, and API", status: "PARTIALOUTAGE" };
  const original = window.__serviceStatusOriginalFetch ??= window.fetch;
  const incidentUrl = "https://status.bsky.app/incident/mock-" + Date.now();
  const json = (body) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith("https://status.bsky.app/")) {
      return original(input, init);
    }
    if (url.endsWith("/summary.json")) {
      return json({
        page: { name: "Bluesky", url: "https://status.bsky.app", status: scenario.page },
        activeIncidents: scenario.page === "HASISSUES"
          ? [{ name: "Mock Incident", started: new Date().toString(), status: "INVESTIGATING", impact: scenario.status, url: incidentUrl }]
          : [],
        activeMaintenances: scenario.page === "UNDERMAINTENANCE"
          ? [{ name: "Mock Maintenance", start: new Date().toString(), status: "INPROGRESS", duration: "60", url: incidentUrl }]
          : [],
      });
    }
    const response = await original(input, init);
    const body = await response.json();
    for (const component of body.components ?? []) {
      if (component.name === scenario.component) {
        component.status = scenario.status;
      }
    }
    return json(body);
  };
  console.log("[service-status mock]", scenario);
})();
```

ブックマークレットにする場合、スクリプトは文末にセミコロンを付けてあるので、改行を空白に置き換えるだけで 1 行にできる。
