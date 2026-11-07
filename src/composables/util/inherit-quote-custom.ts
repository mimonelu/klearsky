import resolveEmbed from "@/composables/util/resolve-embed"

// ポストを新しいデータに置き換える時に、引用先の `__custom` を引き継ぐ
export default function inheritQuoteCustom (oldEmbed?: TTEmbedView, newEmbed?: TTEmbedView) {
  const oldQuote = resolveEmbed(oldEmbed).quote
  const newQuote = resolveEmbed(newEmbed).quote
  if (
    oldQuote?.$type !== "app.bsky.embed.record#viewRecord" ||
    newQuote?.$type !== "app.bsky.embed.record#viewRecord" ||
    oldQuote.uri !== newQuote.uri
  ) {
    return
  }
  if (oldQuote.__custom != null) {
    newQuote.__custom = oldQuote.__custom
  }
  inheritQuoteCustom(oldQuote.embeds?.[0], newQuote.embeds?.[0])
}
