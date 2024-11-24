// SEE: https://github.com/bluesky-social/social-app/blob/main/src/lib/strings/rich-text-manip.ts
import {AppBskyRichtextFacet, RichText, UnicodeString} from "@atproto/api"

// RichText 内のURL文字列をトリム
export default function shortenLinks (rt: RichText) {
  if (!rt.facets?.length) {
    return
  }
  if (rt.facets) {
    for (const facet of rt.facets) {
      const isLink = !!facet.features.find(AppBskyRichtextFacet.isLink)
      if (!isLink) {
        continue
      }
      const { byteStart, byteEnd } = facet.index
      const url = rt.unicodeText.slice(byteStart, byteEnd)
      const shortened = new UnicodeString(toShortUrl(url))
      rt.insert(byteStart, shortened.utf16)
      facet.index.byteStart = byteStart
      facet.index.byteEnd = byteStart + shortened.length
      rt.delete(byteStart + shortened.length, byteEnd + shortened.length)
    }
  }
}

// URL文字列のトリム
function toShortUrl (urlString: string): string {
  try {
    const url = new URL(urlString)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return urlString
    }
    const path = (url.pathname === "/" ? "" : url.pathname) + url.search + url.hash
    if (path.length > 15) {
      return url.host + path.slice(0, 13) + "..."
    }
    return url.host + path
  } catch (e) {
    return urlString
  }
}
