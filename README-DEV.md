# Klearsky Dev Memo

## 仕様
### ポスト画像の制約（2023/03/31現在）
* ポスト画像は最終的にすべてJPEGに変換される
* ポスト画像の最大幅は縦横2000px
* アバター画像も最大幅は縦横2000pxだが、アップロード後に長辺を基準に1000pxにリサイズされ、さらに短辺も1000pxにトリムされる
* バナー画像も最大幅は縦横2000pxだが、アップロード後に長辺を基準に3000pxにリサイズされ、さらに短辺も1000pxにトリムされる
* 画像の最大ファイルサイズは976.56KB

## 設定
### 背景画像URLの挙動
* URLプロトコルから始まる場合は `background-image: url(...);` として設定
  * 例: `https://images.pexels.com/photos/376368/pexels-photo-376368.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
* その他は `background-image: ...;` として設定
  * 例: グラデーション `linear-gradient(to bottom, #0000f0, #0080f0)`
  * 例: Favicon `/klearsky/favicon.svg`

## デザイン
* ロゴのフォント: https://fonts.google.com/specimen/Albert+Sans?preview.text=Klearsky&preview.size=64&preview.text_type=custom&category=Sans+Serif,Display

## その他
* `(?<=...)` はSafari未対応
* `:has()` はFirefox未対応
* `@media not ...` は `@media not all and ...` のように記述しないとSafariで認識されない
* iOSでは `font-size: 16px;` 未満のフォームパーツにフォーカスすると勝手にズームインする。
* `router.go(0)` はSPで機能しない。 `location.reload()` を使用
