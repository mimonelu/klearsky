# 保留タスク

## グループチャット対応

- `chat.bsky.group` レキシコンへの対応
- 現状のチャット実装は [features/chat.md](features/chat.md) 参照

## ポスト再利用時の添付ファイル対応

ReDraft（ポスト再利用）機能で画像/動画も再利用できるようにする。

### 準備済み

- `TTImage` に `video?: TIBlob` 追加済み
- `FileBox.vue` を `files` → `items`、`File` → `TTItem` にリネーム済み（将来 `File | TTImage` に拡張する準備）
- `ReDraft.vue` で `record.embed` から画像/動画メタ（`TTImage[]`）を抽出するロジック実装済み
- `TTSendPostPopupParams` に `medias?: Array<TTImage>` 追加済み
- params 経路（main-state → MainView → SendPostPopup）の伝達済み
- SendPostPopup に TODO コメント残置

### 難所

- **画像**: CDN から DL → File 変換 → 再アップロードで対応可能（圧縮でバイナリが変わるため重複問題なし）
- **動画**: DL に時間がかかる＋Bluesky で同一動画のアップロード不可。BlobRef 再利用が必要
  - `create-embed.ts` が `Array<File>` 前提で `File.type` や `createFileBlobRef` を使っている
  - TTImage の場合は既存 BlobRef をそのまま使うパスの追加が必要
- **FileBox**: `setPreviews` で `URL.createObjectURL(File)` → TTImage は `thumb`/`fullsize` を使う必要あり。動画判定も `File.type` → `TTImage.video` に分岐が必要

### 方針案

1. 画像のみ対応（CDN DL → File 化）、動画は対象外
2. 画像は DL → File 化、動画は BlobRef 再利用（create-embed.ts 改修大）
3. FileBox の TTItem を `File | TTImage` のユニオン型にし、全体を対応

## Post コンポーネントのメモリ最適化

- 仮想スクロールなしで全フィードを DOM 展開しているため、長スクロール時にメモリを大量消費する
- Chrome Beta でのクラッシュ報告あり（`STATUS_BREAKPOINT`）

## 検索フィルタ拡張

- いいね数/リポスト数の最小値（API 非対応のため不可）、返信・メディアの含む/除外（searchPostsV2 への移行が必要）
- 2026-07-16 時点で実装保留、設計検討のみ完了。詳細は [features/search.md](features/search.md)
