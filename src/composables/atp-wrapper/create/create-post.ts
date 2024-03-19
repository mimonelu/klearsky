import Package from "@/../package.json"
import type { AppBskyEmbedImages, AppBskyFeedPost, BlobRef, BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"
import { RichText } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<Error | TTCidUri> {
  if (this.agent == null) return Error("noAgentError")

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

  // リンクカード
  let replyQuoteRepost: undefined | TTPost = undefined
  let external: null | any = null
  let feedOrLinkCard: undefined | any
  if (params.url?.length > 0) {
    // AT URI指定引用リポスト
    const postUri = isPostAtUri(params.url) ? params.url : null
    if (postUri != null) {
      const posts = await this.fetchPosts([postUri])
      if (!posts || posts[0] == null) {
        return Error("noPost")
      }
      replyQuoteRepost = posts[0]
    } else {
      // リンクカード - フィードカード
      const generatorUri = isFeedGeneratorAtUri(params.url)
        ? params.url
        : convertFeedGeneratorUriToAtUri(params.url)
      if (generatorUri != null) {
        const generator: Error | TTFeedGenerator = await this.fetchFeedGenerator(generatorUri)
        if (generator instanceof Error) return Error("noGeneratorError")
        feedOrLinkCard = {
          $type: "app.bsky.embed.record",
          record: {
            cid: generator.cid,
            uri: generator.uri,
          },
        }

      } else {
        // リンクカード - リストカード
        const listUri = isListAtUri(params.url)
          ? params.url
          : convertListUriToAtUri(params.url)
        if (listUri != null) {
          const list: Error | TTList = await this.fetchList(listUri)
          if (list instanceof Error) return Error("noListError")
          feedOrLinkCard = {
            $type: "app.bsky.embed.record",
            record: {
              cid: list.cid,
              uri: list.uri,
            },
          }

        // リンクカード - リンクカード 
        } else {
          external = await Util.parseOgp(
            this,
            params.url,
            params.urlHasImage?.includes(true) ?? false
          )
          if (external == null || external instanceof Error) return Error("parseOgpError")
        }
      }
    }
  }

  // 画像
  let images: null | any = null
  const fileBlobRefs: Array<null | BlobRef> = await Promise.all(
    params.images.map((file: File): Promise<null | BlobRef> => {
      return this.createFileBlobRef({
        file,
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 0.953671875,
      })
    })
  )
  if (fileBlobRefs.some((fileBlobRef: null | BlobRef) => fileBlobRef == null)) {
    return Error("imageCompressionError")
  }

  // 画像サイズのアスペクト比（実際にはサイズ）を取得
  const aspectRatios: Array<undefined | TTAspectRatio> = []
  for (const file of params.images) {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    try {
      await img.decode()
      aspectRatios.push({
        width: img.width,
        height: img.height,
      })
    } catch (error: any) {
      console.error("[klearsky/post]", error)
      aspectRatios.push(undefined)
    }
  }

  if (fileBlobRefs.length > 0) {
    const imageObjects: Array<null | AppBskyEmbedImages.Image> = fileBlobRefs
      .map(
        (
          fileBlobRef: null | BlobRef,
          index: number
        ): null | AppBskyEmbedImages.Image => {
          if (fileBlobRef == null) return null
          const result: AppBskyEmbedImages.Image = {
            image: fileBlobRef,
            alt: params.alts[index] ?? "",
          }
          if (aspectRatios[index] != null) {
            result.aspectRatio = aspectRatios[index]
          }
          return result
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
  if ((params.type === "quoteRepost" || replyQuoteRepost != null) && params.post != null) {
    const quotePost = params.type === "quoteRepost"
      ? params.post
      : replyQuoteRepost ?? params.post
    record.embed = {
      $type: images != null || external != null
        ? "app.bsky.embed.recordWithMedia"
        : "app.bsky.embed.record",
      record: {
        cid: quotePost.cid,
        uri: quotePost.uri,

        // TODO: 添付付きポストを引用リポストしようとするとエラーが発生する不具合の暫定対応
        record: {
          cid: quotePost.cid,
          uri: quotePost.uri,
        }
      },
    }
    if (images != null)
      record.embed.media = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      record.embed.media = { $type: "app.bsky.embed.external", external }
    else if (feedOrLinkCard != null)
      record.embed.media = feedOrLinkCard
  }

  // 画像またはリンクカード
  if (params.type !== "quoteRepost" && replyQuoteRepost == null) {
    if (images != null)
      record.embed = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      record.embed = { $type: "app.bsky.embed.external", external }
    else if (feedOrLinkCard != null)
      record.embed = feedOrLinkCard
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

function isPostAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:plc:[\w\.\-]+\/app\.bsky\.feed\.post\/[\w\.\-]+$/) != null
}

function isFeedGeneratorAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:plc:[\w\.\-]+\/app\.bsky\.feed\.generator\/[\w\.\-]+$/) != null
}

function isListAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:plc:[\w\.\-]+\/app\.bsky\.graph\.list\/[\w\.\-]+$/) != null
}

function convertFeedGeneratorUriToAtUri (uri: string): null | string {
  const matches = uri.match(/^https?:\/\/[\w\.\-]+\/profile\/did:plc:([\w\.\-]+)\/feed\/([\w\.\-]+)$/)
  if (matches?.[1] == null || matches?.[2] == null) return null
  const did = matches[1]
  const rkey = matches[2]
  return `at://did:plc:${did}/app.bsky.feed.generator/${rkey}`
}

function convertListUriToAtUri (uri: string): null | string {
  const matches = uri.match(/^https?:\/\/[\w\.\-]+\/profile\/did:plc:([\w\.\-]+)\/lists\/([\w\.\-]+)$/)
  if (matches?.[1] == null || matches?.[2] == null) return null
  const did = matches[1]
  const rkey = matches[2]
  return `at://did:plc:${did}/app.bsky.graph.list/${rkey}`
}
