# Atmosphere

プロフィールページで、対象アカウントのリポジトリにあるコレクションからドメイン名を列挙し、AT Protocol 上の Bluesky 以外のサービスへのリンクとして表示するセクション。

## 構成

- `src/components/next/Atmosphere/AtmosphereContainer.vue` — 一覧の表示と開閉（開閉状態は設定 `atmosphereDisplay` に保存）
- 各項目はドメイン名とコレクション数を表示する。コレクション名を項目内に並べる案は画面が煩雑になるため見送った。レコード数は `describeRepo` に含まれず、数えるにはコレクションごとに `listRecords` を全ページ取得する必要があるため表示しない
- コレクションはプロフィール表示時に取得済みの `describeRepo` の結果（`profile.__repo.collections`）を使う。追加のリクエストはない

## 経緯

- 以前は特定のサービス（Smoke Signal / Linkat / Frontpage / SkyBeMoreBlue / WhiteWind）ごとにレコードを取得して内容を表示していた。エコシステムが拡大する一方で掲載サービスが廃れ、保守もできなくなったため、サービスに依存しない今の形に置き換えた

## 注意点

- ドメイン名は NSID の上位 2 区切りを逆順にしたもの（`com.whtwnd.blog.entry` → `whtwnd.com`）。NSID のドメインとサービスの URL は一致するとは限らない（例: Frontpage は `unravel.fyi` になる）。また `co.uk` のような 2 段の公開サフィックスは正しく切り出せない。いずれも許容している
- `app.bsky` / `chat.bsky` / `com.atproto` は Bluesky 本体と AT Protocol のコアなので除外する
- NSID はアカウントが自由に作れるため、任意のドメインがリンクになりうる。ドメインの形式に合わないものは除外し、リンクは `Util.safeExternalUrl()` を通す
- favicon は未対応（検討中）。表示する場合はドメイン数ぶんのリクエストが増える点に注意
