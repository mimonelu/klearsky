# AT Protocol / Bluesky 最近の動向まとめ

> 出典: [ATmosphereConf 2026レポート（gihyo.jp, 2026-05-14）](https://gihyo.jp/article/2026/05/ATmosphereConf2026)
> イベント: ATmosphereConf 2026（2026年3月26〜29日、カナダ・バンクーバー UBC キャンパス）

---

## 1. エコシステムの広がり

### ソーシャルグラフの可搬性が現実に

- ユーザーIDはプラットフォームではなくユーザー自身に属するため、異なるアプリ間でフォロー関係を引き継げる
- **Flashes**（写真共有）や **Surf**（コンテンツリーダー）など Bluesky 以外の ATProto アプリでもフォロー関係が継続
- **youandme.at**（QRコード接続アプリ）はカンファレンス直前に開発・急速普及

### 独立インフラの実装が並立

| プロジェクト | 概要 |
|---|---|
| **Blacksky** | Rudy Fraser 氏。黒人コミュニティ向け。Rust 製の独自実装「rsky」で Bluesky と相互運用 |
| **Eurosky** | 欧州非営利団体が運営する PDS。欧州法（GDPR等）に準拠 |
| **Gander Social** | カナダ拠点の同様の取り組み |

### SNS 以外への応用

- **npmx**: npm パッケージ検索サービス。いいねを atproto レコードとして保存。約2週間で 1,000以上の PR・105人以上のコントリビューター獲得
- **Smoke Signal**: RSVP 付きイベント管理
- **Roomy**: グループコミュニケーション（カンファレンス自体のバーチャル基盤に使用）
- **Tangled**: コード協業ツール（フィンランド発、2026年3月に 380万ユーロのシード調達）
- **WhiteWind / Leaflet / Pckt / Offprint**: ブログプラットフォーム各種
- その他: 米国消防の山火事連携、分散型 AI、天文台観測データ共有

Bluesky 新暫定 CEO・Toni Schneider 氏のコメント:
> 「プロダクトロードマップではなく、街が埋まっていく感覚」

---

## 2. プロトコルの標準化と技術進化

### IETF 標準化

- 2025年11月: IETF 124（モントリオール）で議論セッション
- **2026年3月: ATP 作業部会が正式承認**（Bluesky PBC から独立した居場所を獲得）

**初期スコープ:**
- マークル検索木（MST）
- Firehose 同期メカニズム
- AT URI スキーム
- アカウント識別子解決

**スコープ外（当面）:** 非公開データ・Lexicon・モデレーション

### Relay / Sync 1.1 への移行

- 2026年1月: bsky.network の Relay が新実装へ移行
- Sync 1.1 プロトコル対応・MST inversion（効率的差分同期）サポート
- 月額5ドル未満で Relay 運用可能（FIG 氏が実証）
- 現在 12以上の独立 Relay が稼働

### 次の大きな技術課題: 非公開データ（Permissioned Data）

公開データのプロトコルはおおむね完成。次のフォーカスは E2EE と非公開データ:

- **Germ**: E2EE メッセージングアプリ
- Blacksky / Northsky / Habitat が並行設計中
- **2026年夏にかけて実装・実験予定**

---

## 3. 日本の動向

| 取り組み | 内容 |
|---|---|
| **Sky Follower Bridge** | 川俣氏開発の Chrome 拡張。他 SNS のフォロワーが Bluesky にいるかチェック。カンファレンスで LT 登壇 |
| **ハッカソン** | 2026年4月、四谷ラボ × Bluesky 共催 |
| **Skeb 連携** | イラストコミッションサービスが atproto API を実装、数日で 1万人以上が利用 |

---

## 4. まとめ：エコシステムの構造的変化

| | 2023年 | 2026年 |
|---|---|---|
| 位置づけ | iOS 限定招待制 SNS「Bluesky のためのプロトコル」 | IETF 標準化進行中のオープンプロトコル |
| アプリ数 | 数十 | 1,000 以上 |
| インフラ | Bluesky PBC 独占 | 12以上の独立 Relay、複数 PDS |
| 次の課題 | 基本機能の実装 | 非公開データ・E2EE |

ATmosphereConf 2026 セッション動画は Streamplace・YouTube・公式サイトで公開。
ワークショップ教材「Consuming the ATmosphere」「Creating the ATmosphere」は GitHub 公開（日本語版も有志が公開）。
