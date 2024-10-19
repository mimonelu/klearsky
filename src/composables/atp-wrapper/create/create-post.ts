import Package from "@/../package.json"
import type { AppBskyFeedPost } from "@atproto/api"
import { RichText } from "@atproto/api"
import Util from "@/composables/util"
import {
  LIMIT_OF_LIST_MENTION_ACCOUNTS,
  THIRD_PARTY_DOMAIN_LIGHTNING,
  THIRD_PARTY_DOMAIN_VIA,
} from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  const record: AppBskyFeedPost.Record = {
    $type: "app.bsky.feed.post",
    createdAt: params.createdAt ?? new Date().toISOString(),
    text: params.text ?? "",
  }

  // ポスト言語
  if (params.languages != null && params.languages.length > 0) {
    record.langs = params.languages
  }

  // Zapリンク
  if (params.lightning) {
    record.text = Util.makeLightningLinks(
      record.text,
      params.lightning
    ) ?? record.text
  }

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

  // リストメンション
  if (!!params.listMentionDids?.length) {
    if (record.facets == null) {
      record.facets = []
    }
    params.listMentionDids.forEach((did) => {
      record.facets?.push({
        $type: "app.bsky.richtext.facet",
        features: [{
          $type: "app.bsky.richtext.facet#mention",
          did,
        }],
        index: {
          byteEnd: 0,
          byteStart: 0,
        }
      })
    })

    // ユーザーの切り詰め
    record.facets = record.facets.splice(0, LIMIT_OF_LIST_MENTION_ACCOUNTS)
  }

  // カスタムフィールド - Lightning
  if (params.lightning) {
    record[THIRD_PARTY_DOMAIN_LIGHTNING] = params.lightning
  }

  // カスタムフィールド - via
  record[THIRD_PARTY_DOMAIN_VIA] = `Klearsky v${Package.version}`

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
  if (params.labels != null && params.labels.length > 0) {
    record.labels = {
      "$type": "com.atproto.label.defs#selfLabels",
      values: params.labels.map((label: string) => ({ val: label })),
    }
  }

  // 投稿日時の設定
  // NOTICE: 途中の createEmbed における時間経過を考慮
  record.createdAt = params.createdAt ?? new Date().toISOString()

  const response: Error | TTCidUri =
    await this.agent.post(record)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/post]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}
