// SEE: https://github.com/bluesky-social/social-app/blob/main/src/lib/strings/rich-text-manip.ts
import type { Facet, RichText } from "@atproto/api"
import { AppBskyRichtextFacet, UnicodeString } from "@atproto/api"

// RichText 内のURL文字列の省略表記
// `excludedFacets` はカスタムリンクなど、省略表記の対象外とする facet
// `RichText.insert` は挿入量を UTF-16 長で数えるためバイトインデックスとずれる。そのため自前で置換する
export default function shortenLinks (rt: RichText, excludedFacets: Array<Facet> = []) {
  if (!rt.facets?.length) {
    return
  }

  // 後方から置換し、置換前の facet のインデックスを維持する
  const targets = rt.facets
    .filter((facet) => {
      return facet.features.some(AppBskyRichtextFacet.isLink) &&
        !excludedFacets.some((excluded) => isOverlapped(facet, excluded))
    })
    .sort((a, b) => b.index.byteStart - a.index.byteStart)
  for (const target of targets) {
    const { byteStart, byteEnd } = target.index
    const url = rt.unicodeText.slice(byteStart, byteEnd)
    const shortened = new UnicodeString(toShortUrl(url))
    if (shortened.utf16 === url) {
      continue
    }
    const diff = shortened.length - (byteEnd - byteStart)
    rt.unicodeText = new UnicodeString(
      rt.unicodeText.slice(0, byteStart) +
      shortened.utf16 +
      rt.unicodeText.slice(byteEnd)
    )
    target.index.byteEnd = byteStart + shortened.length
    for (const facet of rt.facets) {
      if (facet.index.byteStart >= byteEnd) {
        facet.index.byteStart += diff
        facet.index.byteEnd += diff
      }
    }
  }
}

function isOverlapped (a: Facet, b: Facet): boolean {
  return a.index.byteStart < b.index.byteEnd &&
    b.index.byteStart < a.index.byteEnd
}

// `URL` を通すと非 ASCII 文字がパーセントエンコードや punycode に変換されるため、元の文字列から切り出す
const HTTP_URL_REGEXP = /^https?:\/\/([^/?#]+)(.*)$/is

// URL文字列の省略表記
function toShortUrl (urlString: string): string {
  const match = urlString.match(HTTP_URL_REGEXP)
  if (match == null) {
    return urlString
  }
  const host = match[1]
  const path = Array.from(match[2] === "/" ? "" : match[2])
  if (path.length > 15) {
    return host + path.slice(0, 13).join("") + "..."
  }
  return host + path.join("")
}
