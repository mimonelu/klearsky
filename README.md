![Klearsky](./public/img/ogp.png "Klearsky")

# Klearsky
A design-first web client for the AT Protocol a.k.a. Bluesky.

## GitHub
* Repository: https://github.com/mimonelu/klearsky

## Deployment destination
Klearsky is deployed on Cloudflare.
* Production: https://klearsky.pages.dev/
* Staging: https://staging.klearsky.pages.dev/

## Development environment
* Node: v18.17.1 (based on Cloudflare)
* Framework: Vite + Vue3 (see `package.json` )

## Custom fields
* `POST.record.via?: string` Client name (Klearsky)
* `POST.record.lightning?: string` Used in Zap! link
* `PROFILE.record.pinnedPost?: string` Used in pinned post

## External linkage services
* MyMemory: 自動翻訳で使用。ユーザーのメールアドレスを自動付与している
* Lightning Network: Zap! リンク／ボタンで使用。 `lightning:` プロトコルでリンクしているだけ

## Coproduct
* `/coproduct/stats.html`: `npm run build` で rollup-plugin-visualizer によるバンドルファイルの一覧を副次的に生成

## Design resources
* Logo font: https://fonts.google.com/specimen/Albert+Sans?preview.text=Klearsky&preview.size=64&preview.text_type=custom&category=Sans+Serif,Display
* SVG icons: https://pictogrammers.com/library/mdi/

## Others
* AT Protocol Ecosystem: https://github.com/bluesky-social/atproto-ecosystem
* Scrapbox: https://scrapbox.io/Bluesky/%E9%96%A2%E9%80%A3%E3%83%84%E3%83%BC%E3%83%AB
