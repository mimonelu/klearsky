import Package from "@/../package.json"
import type { AppBskyEmbedImages, AppBskyFeedPost, BlobRef, BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"
import { RichText } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<boolean> {
  if (this.agent == null) return false

  const record: AppBskyFeedPost.Record = {
    $type: "app.bsky.feed.post",
    createdAt: params.createdAt != null
      ? new Date(params.createdAt).toISOString()
      : new Date().toISOString(),
    text: params.text,

    // カスタムフィールド - via
    via: `Klearsky v${Package.version}`,
  }

  // ポスト言語
  if (params.languages != null && params.languages.length > 0)
    record.langs = params.languages

  // ポストタグ
  if (params.tags != null)
    record.tags = params.tags.map((tag: TTMyTag) => tag.text)

  // Zapリンク
  if (params.lightning)
    record.text = record.text.replace(/@zap(?=\W|$)/gi, `[⚡️Zap!](lightning:${params.lightning})`)

  // カスタムリンク
  const customLinks = AtpUtil.makeCustomLinks(record.text)
  record.text = customLinks.text
  if (customLinks.facets.length > 0) record.facets = customLinks.facets

  // Facets
  const richText = new RichText({ text: record.text })
  await richText.detectFacets(this.agent)
  record.text = richText.text
  if (richText.facets != null) {
    if (record.facets != null) record.facets.push(...richText.facets)
    else record.facets = richText.facets
  }

  // カスタムフィールド - Lightning
  if (params.lightning) record.lightning = params.lightning

  // リンクカード／フィードカード
  let external: null | any = null
  let feedCard: undefined | any
  if (params.url?.length > 0) {
    // フィードカード
    let generatorUri: undefined | string
    const isAtUri = params.url.match(/^at:\/\/did:plc:[\w\.\-]+\/app\.bsky\.feed\.generator\/[\w\.\-]+$/) != null
    if (isAtUri) {
      generatorUri = params.url
    } else {
      const matches = params.url.match(/^https?:\/\/[\w\.\-]+\/profile\/did:plc:([\w\.\-]+)\/feed\/([\w\.\-]+)$/)
      if (matches != null) {
        const did = matches[1]
        const id = matches[2]
        generatorUri = `at://did:plc:${did}/app.bsky.feed.generator/${id}`
      }
    }
    if (generatorUri != null) {
      const generator: Error | TTFeedGenerator = await this.fetchFeedGenerator(generatorUri)
      if (generator instanceof Error) return false
      feedCard = {
        $type: "app.bsky.embed.record",
        record: {
          cid: generator.cid,
          uri: generator.uri,
        },
      }
    }

    // リンクカード
    else {
      external = await Util.parseOgp(
        this,
        params.url,
        params.urlHasImage?.includes(true) ?? false
      )
      if (external == null) return false
    }
  }

  // 画像
  let images: null | any = null
  const fileBlobRefs: Array<null | BlobRef> = await Promise.all(
    params.images.map((file: File): Promise<null | BlobRef> => {
      return this.createFileBlob({
        file,
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 0.953671875,
      })
    })
  )
  if (fileBlobRefs.length > 0) {
    const imageObjects: Array<null | AppBskyEmbedImages.Image> = fileBlobRefs
      .map(
        (
          fileBlobRef: null | BlobRef,
          index: number
        ): null | AppBskyEmbedImages.Image => {
          return fileBlobRef == null
            ? null
            : {
                image: fileBlobRef,
                alt: params.alts[index] ?? "",
              }
        }
      )
      .filter((image: null | AppBskyEmbedImages.Image) => image != null)
    if (imageObjects.length > 0) images = imageObjects
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

  // 引用リポスト
  else if (params.type === "quoteRepost" && params.post != null) {
    record.embed = {
      $type:
        images != null || external != null
          ? "app.bsky.embed.recordWithMedia"
          : "app.bsky.embed.record",
      record: {
        record: params.post,
        cid: params.post?.cid,
        uri: params.post?.uri,
      },
    }
    if (images != null)
      record.embed.media = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      record.embed.media = { $type: "app.bsky.embed.external", external }
    else if (feedCard != null)
      record.embed.media = feedCard
  }

  // 画像またはリンクカード
  if (params.type !== "quoteRepost") {
    if (images != null)
      record.embed = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      record.embed = { $type: "app.bsky.embed.external", external }
    else if (feedCard != null)
      record.embed = feedCard
  }

  // セルフポストラベル
  if (params.labels != null && params.labels.length > 0)
    record.labels = {
      "$type": "com.atproto.label.defs#selfLabels",
      values: params.labels.map((label: string) => ({ val: label })),
    }

  const response: ComAtprotoRepoCreateRecord.OutputSchema = await (
    this.agent as BskyAgent
  ).post(record)
  console.log("[klearsky/post]", response)
  return true
}
