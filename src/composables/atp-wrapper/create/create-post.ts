import Package from "@/../package.json"
import type { AppBskyFeedPost, BskyAgent } from "@atproto/api"
import { RichText } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<Error | TTCidUri> {
  if (this.agent == null) return Error("noAgentError")

  const record: AppBskyFeedPost.Record = {
    $type: "app.bsky.feed.post",
    createdAt: params.createdAt != null
      ? params.createdAt
      : new Date().toISOString(),
    text: params.text ?? "",

    // カスタムフィールド - via
    via: `Klearsky v${Package.version}`,
  }

  // ポスト言語
  if (params.languages != null && params.languages.length > 0)
    record.langs = params.languages

  // ポストタグ
  if (params.tags != null && params.tags.length > 0)
    record.tags = params.tags.map((tag: TTMyTag) => tag.text)

  // Zapリンク
  if (params.lightning)
    record.text = record.text.replace(/@zap(?=\W|$)/gi, `[⚡️Zap!](lightning:${params.lightning})`)

  // カスタムリンク
  const customLinks = Util.makeCustomLinks(record.text)
  record.text = customLinks.text
  if (customLinks.facets.length > 0) {
    record.facets = customLinks.facets
  }

  // Facets
  const richText = new RichText({ text: record.text })
  await richText.detectFacets(this.agent)
  record.text = richText.text
  if (richText.facets != null) {
    if (record.facets != null) {
      record.facets.push(...richText.facets)
    } else {
      record.facets = richText.facets
    }
  }

  // カスタムフィールド - Lightning
  if (params.lightning) {
    record.lightning = params.lightning
  }

  // Embed
  const embedResult = await Util.createEmbed(this, record, params)
  if (embedResult instanceof Error) {
    return embedResult
  }

  // リプライ
  if (params.type === "reply" && params.post != null) {
    record.reply = {
      root: {
        cid: params.post.record.reply?.root?.cid ?? params.post.cid,
        uri: params.post.record.reply?.root?.uri ?? params.post.uri,
      },
      parent: {
        cid: params.post.cid,
        uri: params.post.uri,
      },
    }
  }

  // セルフポストラベル
  if (params.labels != null && params.labels.length > 0)
    record.labels = {
      "$type": "com.atproto.label.defs#selfLabels",
      values: params.labels.map((label: string) => ({ val: label })),
    }

  const response: Error | TTCidUri =
    await (this.agent as BskyAgent).post(record)
      .then((value: TTCidUri) => value)
      .catch((error: any) => error)
  console.log("[klearsky/post]", response)
  if (response instanceof Error) return response
  return response
}
