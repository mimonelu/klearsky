# フォント

全体のフォントの指定は `src/scss/_elements.scss` の `:root` にある。#126 で見直した。

## 方針

- 欧文・和文ともウェブフォントを使わず、OS のフォントに任せる
- 和文は OS ごとのフォントを明示し、Mac と Windows の差を縮める（なくはならない）。ただし日本語表示時の Safari では明示した和文フォントが効かない（後述）
- 例外として、タイ語は Zalgo 文字列対策で IBM Plex Sans Thai をウェブフォントとして先頭に置く（`unicode-range` で指定したタイ語と一部の結合記号がある時だけ読み込まれる）

## 指定の順序

`IBM Plex Sans Thai` →（日本語表示時のみ）OS の欧文フォント → 和文フォント → `system-ui` → `sans-serif` → 絵文字フォント

- 日本語表示時は、和文フォントの前に OS の欧文フォント（`-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`）を置く。和文フォントは欧文の字形も持つため、前に置かないと英数字がヒラギノや BIZ UDPGothic の字形になる（Inter を外した直後にこの状態で本番に出た）
- 和文フォントは `system-ui` より前に置く。後ろに置くと、Windows では Segoe UI にない和文が OS 任せのフォントになり、指定が効かない
- 和文フォントは `:lang(ja)` の時だけ指定する。全員に指定すると、中国語・韓国語の環境の人にも漢字が日本の字形で表示され、ハングルなどが別のフォントになって混在する
- `<html lang>` は i18n プラグインが表示言語に合わせて設定する。翻訳がない言語は `en` にする
- Hiragino Sans は同じ `font-weight` でも 1 段階太いウェイトが割り当てられるため使わず、Hiragino Kaku Gothic ProN を使う
- San Francisco は名前では指定できない（`.SF NS` などの内部名も効かない）。通常は `system-ui` で指定する。日本語表示時は `system-ui` を和文フォントより前に置けないため、Mac 向けの別名 `-apple-system`（Safari・Firefox）と `BlinkMacSystemFont`（Chrome）を使う

## 日本語表示時の Safari

Safari（iOS・iPadOS の全ブラウザを含む）では、`-apple-system` が和文も OS 任せのフォントで表示し、後ろの和文フォントが効かない。和文はヒラギノより小さく詰まって見える。Chrome では和文フォントが効く。Firefox は未確認。

San Francisco は名前で指定できないため、Safari で San Francisco と指定どおりの和文フォントは両立できない。以下の候補から、英数字を San Francisco にできる `-apple-system` を選んだ。

| Safari での候補 | 英数字 | 和文 |
|---|---|---|
| `-apple-system`（採用） | San Francisco | OS 任せ（小さく詰まる） |
| Helvetica Neue | Helvetica Neue（丸く見える） | 指定どおりのヒラギノ |
| 指定なし | ヒラギノの欧文（丸文字のよう） | 指定どおりのヒラギノ |

## 欧文に Inter を使わない理由

#126 で一度 Inter（Google Fonts）を適用したが、OS のフォントに戻した。それまでは `InterVariable` という誤ったファミリー名のため、Inter は一度も効いていなかった。

- 小文字の高さ（x-height）と字幅が大きく、同じ `font-size` でも一回り大きく見える。利用者から「サイズが変わった」との指摘があった
- Inter だけを縮める `size-adjust` は `@font-face` を自前で書く必要があり、Google Fonts の CSS では使えない。`font-size` を変えると和文も変わる
- Mac では San Francisco と字形がほぼ同じで、適用する利点が見えにくい
- 文脈による字形の置き換えで、`->` が矢印に、`3x4` の `x` が `×` に表示される。無効にする指定（`font-variant-ligatures: no-contextual`）が別に要る
- 表示を止める CSS のリクエストとフォントファイルの読み込みが増える

代わりに、欧文は Mac と Windows で字形が異なる（San Francisco と Segoe UI）。再びウェブフォントを検討する場合は、上記のサイズと置き換えの問題に対処すること。

## 採用しない案

- **和文のウェブフォント（Noto Sans JP など）**: Mac と Windows の差はなくせるが、以前使っていた時にスマホでポストの描画が重くなったため外したと思われる
- **`text-rendering: optimizeLegibility`**: 現在のブラウザは既定でカーニングが効き、スマホで描画が重くなることがある
- **`font-synthesis-weight: none`**: タイ語のフォントは通常のウェイトしか読み込んでおらず、無効にするとタイ語が太字にならなくなる
