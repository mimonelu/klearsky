import type { AppBskyEmbedImages, AppBskyFeedPost, BlobRef, BskyAgent } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  atp: TIAtpWrapper,
  parent: any,
  params: TTCreatePostParams
): Promise<Error | undefined> {
  // リンクカード
  let manualQuoteRepost: undefined | TTPost = undefined
  let external: null | any = null
  let feedOrLinkCard: undefined | any
  if (params.url != null && params.url.length > 0) {
    // AT URI指定引用リポスト
    const postUri = isPostAtUri(params.url) ? params.url : null
    if (postUri != null) {
      const posts = await atp.fetchPosts([postUri])
      if (!posts || posts[0] == null) {
        return Error("noPost")
      }
      manualQuoteRepost = posts[0]
    } else {
      // リンクカード - フィードカード
      const generatorUri = isFeedGeneratorAtUri(params.url)
        ? params.url
        : convertFeedGeneratorUriToAtUri(params.url)
      if (generatorUri != null) {
        const generator: Error | TTFeedGenerator = await atp.fetchFeedGenerator(generatorUri)
        if (generator instanceof Error) {
          return Error("noGeneratorError")
        }
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
          const list: Error | TTList = await atp.fetchList(listUri)
          if (list instanceof Error) {
            return Error("noListError")
          }
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
            atp,
            params.url,
            params.urlHasImage?.includes(true) ?? false
          )
          if (external == null) {
            return Error("parseOgpError")
          }
          if (external instanceof Error) {
            return external
          }
        }
      }
    }
  }

  // 画像
  let images: null | any = null
  const fileBlobRefs: Array<null | BlobRef> = await Promise.all(
    params.images?.map((file: File): Promise<null | BlobRef> => {
      return atp.createFileBlobRef({
        file,
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 0.953671875,
      })
    }) ?? []
  )
  if (fileBlobRefs.some((fileBlobRef: null | BlobRef) => fileBlobRef == null)) {
    return Error("imageCompressionError")
  }

  // 画像サイズのアスペクト比（実際にはサイズ）を取得
  const aspectRatios: Array<undefined | TTAspectRatio> = []
  if (params.images != null) {
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
            alt: params.alts?.[index] ?? "",
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

  // 引用リポスト
  if ((params.type === "quoteRepost" && params.post != null) || manualQuoteRepost != null) {
    const quotePost = params.type === "quoteRepost"
      ? params.post as TTPost
      : manualQuoteRepost as TTPost
    parent.embed = {
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
      parent.embed.media = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      parent.embed.media = { $type: "app.bsky.embed.external", external }
    else if (feedOrLinkCard != null)
      parent.embed.media = feedOrLinkCard
  }

  // 画像またはリンクカード
  if (params.type !== "quoteRepost" && manualQuoteRepost == null) {
    if (images != null)
      parent.embed = { $type: "app.bsky.embed.images", images }
    else if (external != null)
      parent.embed = { $type: "app.bsky.embed.external", external }
    else if (feedOrLinkCard != null)
      parent.embed = feedOrLinkCard
  }
}

function isPostAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.feed\.post\/[\w\.\-]+$/) != null
}

function isFeedGeneratorAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.feed\.generator\/[\w\.\-]+$/) != null
}

function isListAtUri (uri: string): boolean {
  return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.graph\.list\/[\w\.\-]+$/) != null
}

function convertFeedGeneratorUriToAtUri (uri: string): null | string {
  const matches = uri.match(/^https?:\/\/[\w\.\-]+\/profile\/(did:\w+:[\w\.\-]+)\/feed\/([\w\.\-]+)$/)
  if (matches?.[1] == null || matches?.[2] == null) return null
  const did = matches[1]
  const rkey = matches[2]
  return `at://${did}/app.bsky.feed.generator/${rkey}`
}

function convertListUriToAtUri (uri: string): null | string {
  const matches = uri.match(/^https?:\/\/[\w\.\-]+\/profile\/(did:\w+:[\w\.\-]+)\/lists\/([\w\.\-]+)$/)
  if (matches?.[1] == null || matches?.[2] == null) return null
  const did = matches[1]
  const rkey = matches[2]
  return `at://${did}/app.bsky.graph.list/${rkey}`
}
