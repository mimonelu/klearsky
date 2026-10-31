import uri from "@/composables/util/uri"

// ポストを引用しているポストかどうかを返す（フィードやリスト等の埋め込みは含まない）
export default function (post?: TTPost): boolean {
  const embed = post?.record?.embed ?? post?.value?.embed
  const quotedUri = (embed?.record?.uri ?? embed?.record?.record?.uri) as undefined | string
  return quotedUri != null && uri.isPostAtUri(quotedUri)
}
