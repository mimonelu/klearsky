import safeUrl from "@/composables/util/safe-url"

// 外部由来の URL を開いてよいスキーム
// `javascript:` などを `href` や `window.open()` に渡さないための許可リスト
const ALLOWED_PROTOCOLS = ["http:", "https:", "lightning:"]

// 許可されたスキームの URL であれば正規化した URL 文字列を、そうでなければ `undefined` を返す
// スキームの判定はブラウザと同じ解釈になるよう `URL` のパース結果で行う
export default function (url?: string): undefined | string {
  if (!url) {
    return
  }
  const urlObject = safeUrl(url)
  if (urlObject == null || !ALLOWED_PROTOCOLS.includes(urlObject.protocol)) {
    return
  }
  return urlObject.href
}
