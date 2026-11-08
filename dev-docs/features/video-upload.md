# 動画のアップロード（`createVideo`）

ポストに添付した動画（または動画に変換した GIF）を動画サービス（`video.bsky.app`）で処理し、blob を得る処理（#113）。単一リクエスト方式（`uploadVideo`）を使う。

## 流れ

1. `getServiceAuth` で PDS 宛てのサービス認証トークンを得る
2. `uploadVideo` に動画を送り、`jobId` を得る
3. `getJobStatus` で処理の完了を待ち、`blob` を得る
4. `createEmbed` が `blob` を `app.bsky.embed.video` に入れ、`createPost` が投稿する

## トークン

- **aud は PDS、lxm は `com.atproto.repo.uploadBlob`**: 動画サービスは、処理の後にこのトークンでユーザーの代わりに PDS へ動画を保存する
- **有効期限は、アップロードと処理が終わるまで切れない長さにする**: 切れると PDS に保存できず、処理は完了しない。現状の値の見直しは #113
- **パスワード認証の aud はログイン先になる**: `did:web:bsky.social` などになり、公式アプリ（PDS）と異なるが、PDS はエントリーウェイの DID も受け付けるので問題ない

## 本文の読み方

- **ステータスに関係なく本文を読む**: 失敗の理由も、処理済みの動画の `jobId` も、ok 以外のステータスの本文に入る
- **2 つの形を読む**: `JobStatus` が最上位に入る形と、`jobStatus` の下に入る形がある。レキシコンは後者だが、通常の成功は前者で返る。`json.jobStatus ?? json` を `JobStatus` として扱う
- **`blob` があれば待たない**: 本文に `blob` があれば、`getJobStatus` を待たずに使う

## 失敗の理由の表示

- `error` と `message` をそのまま表示する（両方あれば `error: message`）。最上位になければ `jobStatus` の下を読む
- 処理名と HTTP ステータス（`JOB_STATE_FAILED` では `failureCode`）を添える。報告されたエラーから、どの処理でなぜ失敗したかを切り分けるため
- 取り出せなければ `apiError` の文言に処理名と詳細を添える
- 翻訳キーへの対応は、実際に返る値を確かめてから行う（#113）

## 処理済みの動画（409）

- 同じ動画の投稿が残っている状態で同じ動画を送ると、409 で `already_exists` と `jobId` が返る（`already_exists: Video already processed`）
- `jobId` から `getJobStatus` の待機に進めば、投稿できる
- 同じ動画の投稿をすべて削除した後に送ると、409 は返らず、通常どおり処理された
- `JOB_STATE_COMPLETED` で `blob` がなければ、公式アプリと同じく、すぐ失敗とする

## 実機確認

- 同じ動画の投稿を残したまま同じ動画を投稿すると、409 の経路を確かめられる。実際にポストが作成される
- 本文は、コンソールの `createVideo`（`uploadVideo` の本文）と `getJobStatus` のログで見られる

## 残る課題

- `getJobStatus` は失敗を再試行せず、トークンを付けて呼ぶ。公式アプリはトークンなしで呼び、失敗を再試行する。確認は回数で打ち切る。いずれも #113 で見直す
- 期限切れ時のステータスと本文、他の失敗の HTTP ステータスは未確認
- 公式アプリは 2026 年 8 月にマルチパート方式へ移行し、`uploadVideo` を使っていない。`uploadVideo` が廃止されると、動画を投稿できなくなる
