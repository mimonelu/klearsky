import resolveEmbed from "@/composables/util/resolve-embed"
import uri from "@/composables/util/uri"

// ポストを引用しているポストかどうかを返す（フィードやリスト等の埋め込みは含まない）
export default function (post?: TTPost): boolean {
  const quotedUri = resolveEmbed(post?.record?.embed).quoteRef?.uri
  return quotedUri != null && uri.isPostAtUri(quotedUri)
}
