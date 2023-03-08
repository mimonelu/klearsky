# Klearsky Memo
それは永遠のWIP

## Visions
* Blueskyの非公式個人開発Webクライアント
* いずれリリースされるであろう公式Webクライアントとの差別化を念頭に置いている
* 上記と合わせて、独自機能の実装も視野に入れている
* 何であれポートフォリオとして紹介できる程度の作り込みを最低保障ラインとしている

## Dev memo
大体の流れは `LoginPopup.vue` を見るとわかる。

### Routing
* App.vue
  * views/HomeView.vue ← トップページ（将来的にはスプラッシュしても良い）
  * views/MainView.vue ← Klearsky本体
    * views/main/xxx.vue
  * views/xxx.vue ← 何らか別の静的ページ（ヘルプなど）

### MainView.vue
いわゆるLayoutとして機能させている。
* 手動／自動ログイン
* 実行時エラーの捕捉と表示（要再考）
* MainStateの作成

### MainState
`MainView.vue` 配下にあるコンポーネント・ビュー用のグローバル変数。provide/injectでやり取りする。
```
type MainState = {
  atp: any;          // @atproto/api のラッパーオブジェクト
  mounted: boolean;  // MainViewがMountedされた
  hasLogin: boolean; // ログインしている
  error: any;        // 実行時エラーオブジェクト
}
```

## Tasks
* background-image を使わずに img を使い、 LazyLoad に対応する
* テンプレート構文内の `$t` がLintに引っかかる。対策したいが方法が不明
* `.vue` の型宣言が見つからないという警告に対応すること
* MainStateの型定義が無視されたりされなかったりする。 `atp` にも型付けすること
* マルチアカウントに対応すること
* 送信ポストにEntityを設定すること。でもとりあえずURLだけで良し
* 受信ポストのEntityは無視して自力解析した方が世のため人のためでは
* 添付画像は横幅1000px以下になるようリサイズすること
* GitHub Actionsに対応しなければならない
* Piniaは未使用であれば削除すること
* OGPを設定すること
* ポストの投稿とプロフィールの編集を実装したら他2つの居候アプリを削除すること
* このメモを消すこと
