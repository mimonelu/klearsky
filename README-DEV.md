# Klearsky Dev Memo

## Meta
* Description: `A design-first web client for the AT Protocol a.k.a. Bluesky.`

## GitHub
* リポジトリ: https://github.com/mimonelu/klearsky
* イシュー: https://github.com/mimonelu/klearsky/issues

## デプロイ先
* Production: https://klearsky.pages.dev/
* Staging: https://staging.klearsky.pages.dev/

## カスタムフィールド
* POST.record.via?: string
  * クライアント名
* POST.record.lightning?: string
  * Zapボタンで使用

## 外部連携サービス
* MyMemory
  * 自動翻訳で使用。ユーザーのメールアドレスを自動付与している
* Lightning Network
  * Zapボタンで使用。 `lightning:` プロトコルでリンクしているだけ

## Coproduct
* rollup-plugin-visualizer
  * `npm run build` で `/coproduct/stats.html` を生成

## Tools
* svg-list.js
  * 使用中のSVGファイルを一覧できるHTMLを生成

## デザインリソース
* ロゴのフォント: https://fonts.google.com/specimen/Albert+Sans?preview.text=Klearsky&preview.size=64&preview.text_type=custom&category=Sans+Serif,Display
* SVGアイコン: https://pictogrammers.com/library/mdi/

## その他
* AT Protocol Ecosystem: https://github.com/bluesky-social/atproto-ecosystem
* 関連ツール https://scrapbox.io/Bluesky/%E9%96%A2%E9%80%A3%E3%83%84%E3%83%BC%E3%83%AB
