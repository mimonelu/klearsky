// embed をメディアと引用先に分ける
// NOTICE: Raw は他のクライアントが自由に書けるため、`$type` が正しくても中身の欠落を想定する
export default function (embed?: TTEmbedView | TTEmbedRaw): TTResolvedEmbed {
  switch (embed?.$type) {
    case "app.bsky.embed.recordWithMedia#view":
      return { media: embed.media, quote: embed.record?.record }
    case "app.bsky.embed.record#view":
      return { quote: embed.record }
    case "app.bsky.embed.recordWithMedia":
      return { media: embed.media, quoteRef: embed.record?.record }
    case "app.bsky.embed.record":
      return { quoteRef: embed.record }
    default:
      return { media: embed }
  }
}
