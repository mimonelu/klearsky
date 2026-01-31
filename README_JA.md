[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/E1E81GN7CG)

![Klearsky](./public/img/ogp.png "Klearsky")

# Klearsky

AT Protocol（Bluesky）向けの高機能Webクライアント。豊富なカスタマイズオプションと先進的な機能を搭載。

## ✨ 機能

- **🎨 リッチなユーザーインターフェース**: 洗練されたモダンなデザインと豊富なカスタマイズオプション
- **🌍 多言語対応**: 日本語、英語、フランス語、韓国語、ドイツ語に対応
- **📱 レスポンシブデザイン**: デスクトップ、タブレット、モバイルデバイスに最適化
- **🔄 リアルタイム同期**: SharedWorkerによるタブ間セッション同期
- **⚡ パフォーマンス最適化**: 高度なキャッシュ、遅延読み込み、最適化されたバンドルサイズ
- **🛡️ プライバシー重視**: ローカルデータストレージとオプションのクラウド同期
- **🔧 高度なカスタマイズ**: フィード、通知、UI動作の詳細設定
- **🔐 OAuth対応**: Bluesky OAuth認証
- **💬 チャット対応**: Blueskyチャット機能の統合
- **⚡ Lightning統合**: Lightning Network「Zap」決済のサポート
- **🏷️ コンテンツラベル**: 高度なコンテンツフィルタリングとモデレーションツール

## 🚀 クイックスタート

### 前提条件

- Node.js v18.17.1以上
- npmまたはyarnパッケージマネージャー

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/mimonelu/klearsky.git
cd klearsky
```

2. 依存関係をインストール:
```bash
npm install
```

3. 開発サーバーを起動:
```bash
npm run dev
```

4. ブラウザで `http://localhost:5173/` を開く

## 🛠️ 開発

### 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを http://localhost:5173/ で起動 |
| `npm run build` | 型チェック付きでプロダクション用にビルド |
| `npm run build-only` | 型チェックなしでプロダクション用にビルド |
| `npm run type-check` | TypeScript型チェックを実行 |
| `npm run preview` | プロダクションビルドをローカルでプレビュー |
| `npm run lint` | ESLintを自動修正付きで実行 |

### 技術スタック

- **フレームワーク**: Vue 3 with Composition API
- **言語**: TypeScript
- **ビルドツール**: Vite
- **スタイリング**: SCSS with CSSカスタムプロパティ
- **状態管理**: Vueリアクティビティとカスタムコンポーザブル
- **ルーティング**: Vue Router 4
- **AT Protocol**: @atproto/api統合
- **デプロイ**: Cloudflare Pages

### アーキテクチャ

Klearskyは以下の主要コンポーネントからなるモジュラーアーキテクチャを採用：

- **コンポーザブルベースのロジック**: 再利用可能なコンポーザブルでアプリケーションロジックを整理
- **コンポーネント階層**: 機能別に整理された構造化されたコンポーネント組織
- **状態管理**: 専門的なサブマネージャーを持つリアクティブなグローバル状態
- **API抽象化**: AT Protocolインタラクションの包括的なAtpWrapper
- **ワーカーベースキャッシュ**: タブ間セッション管理のためのSharedWorker

### プロジェクト構成

```
src/
├── components/          # 機能別に整理された再利用可能なUIコンポーネント
├── composables/         # Vueコンポーザブルとアプリケーションロジック
│   ├── atp-wrapper/    # AT Protocol API抽象化レイヤー
│   └── main-state/     # グローバル状態管理モジュール
├── views/              # ページレベルのVueコンポーネント
├── translations/       # i18n翻訳ファイル（ja, en, fr, ko, de）
├── consts/            # アプリケーション定数と設定
├── plugins/           # Vueプラグインとディレクティブ
└── scss/              # グローバルスタイルと変数
```

詳細なアーキテクチャ情報については、[CLAUDE.md](./CLAUDE.md)をご覧ください。

## 🌐 デプロイ

### プロダクション
- **本番サイト**: https://klearsky.pages.dev/
- **ステージング**: https://staging.klearsky.pages.dev/

KlearskyはCloudflare Pagesでデプロイされ、mainブランチからの自動デプロイメントが設定されています。

## 🔧 カスタムAT Protocol拡張

KlearskyはいくつかのカスタムAT Protocolレコードとフィールドを実装：

### カスタムレコード（コレクション）
- `space.aoisora.bookmark` - 投稿保存用のカスタムブックマークシステム
- `net.mimonelu.klearsky.extraFeed` - トレンドページとグローバルフィード設定の保存
- `net.mimonelu.klearsky.repostMutes` - リポストミュート

### カスタムフィールド
- `app.bsky.feed.post.record["net.mimonelu.klearsky.via"]` - クライアント識別（Klearsky）
- `app.bsky.feed.post.record["net.mimonelu.klearsky.lightning"]` - Lightning Network決済統合

## 🔗 外部サービス

### 統合サービス
- **MyMemory翻訳API**: ユーザーメール統合による自動投稿翻訳
- **Lightning Network**: `lightning:`プロトコルリンクを使用した「Zap」機能の決済統合

## 🎨 デザインリソース

- **ロゴフォント**: [Albert Sans](https://fonts.google.com/specimen/Albert+Sans?preview.text=Klearsky&preview.size=64&preview.text_type=custom&category=Sans+Serif,Display)
- **アイコン**: [Material Design Icons](https://pictogrammers.com/library/mdi/)

## 📖 ドキュメント・コミュニティ

- **公式リポジトリ**: https://github.com/mimonelu/klearsky
- **Blueskyコミュニティショーケース**: [注目クライアント](https://docs.bsky.app/showcase?operator=AND&tags=favorite&tags=client&tags=opensource)
- **AT Protocolエコシステム**: [掲載プロジェクト](https://github.com/bluesky-social/atproto-ecosystem)

## 🤝 コントリビューション

コントリビューションを歓迎します！イシュー、機能リクエスト、プルリクエストをお気軽にお送りください。

## 📄 ライセンス

このプロジェクトはオープンソースです。詳細についてはライセンスファイルをご確認ください。

---

Built with ❤️ for the Bluesky community