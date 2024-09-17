import type { AppBskyEmbedImages, AppBskyEmbedVideo, BlobRef } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  atp: TIAtpWrapper,
  parent: any,
  params: TTCreatePostParams
): Promise<Error | undefined> {
  // リンクカード
  let manualQuoteRepost: undefined | TTPost = undefined
  let external: undefined | TTExternal = undefined
  let feedOrLinkOrStarterPackCard: undefined | any
  if (params.url != null && params.url.length > 0) {
    // AT URI指定引用リポスト
    const postUri = Util.isPostAtUri(params.url) ? params.url : null
    if (postUri != null) {
      const posts = await atp.fetchPosts([postUri])
      if (posts instanceof Error) {
        return posts
      }
      if (posts[0] == null) {
        return Error("noPost")
      }
      manualQuoteRepost = posts[0]
    } else {
      // リンクカード - フィードカード
      const generatorUri = Util.isFeedGeneratorAtUri(params.url)
        ? params.url
        : convertFeedGeneratorUriToAtUri(params.url)
      if (generatorUri != null) {
        const generator: Error | TTFeedGenerator = await atp.fetchFeedGenerator(generatorUri)
        if (generator instanceof Error) {
          return Error("noGeneratorError")
        }
        feedOrLinkOrStarterPackCard = {
          $type: "app.bsky.embed.record",
          record: {
            cid: generator.cid,
            uri: generator.uri,
          },
        }

      } else {
        // リンクカード - リストカード
        const listUri = Util.isListAtUri(params.url)
          ? params.url
          : convertListUriToAtUri(params.url)
        if (listUri != null) {
          const list = await atp.fetchList(listUri)
          if (list instanceof Error) {
            return list
          }
          feedOrLinkOrStarterPackCard = {
            $type: "app.bsky.embed.record",
            record: {
              cid: list.cid,
              uri: list.uri,
            },
          }

        // リンクカード - スターターパックカード
        } else {
          const starterPackUri = Util.isStarterPackAtUri(params.url)
            ? params.url
            : convertStarterPackUriToAtUri(params.url)
          if (starterPackUri != null) {
            const starterPack: Error | TIStarterPack = await atp.fetchStarterPack(starterPackUri)
            if (starterPack instanceof Error) {
              return Error("noStarterPackError")
            }
            feedOrLinkOrStarterPackCard = {
              $type: "app.bsky.embed.record",
              record: {
                cid: starterPack.cid,
                uri: starterPack.uri,
              },
            }

          // リンクカード - リンクカード
          } else {
            const response = await Util.parseOgp(
              atp,
              params.url,
              params.urlHasImage?.includes(true) ?? false
            )
            if (response instanceof Error) {
              return response
            }
            external = response

            // FYI: OGPを無視して値を書き換える場合
            // external.title = "これはリンクカードのタイトルです"
            // external.description = "これはリンクカードの説明です"
          }
        }
      }
    }
  }

  // 画像
  const images: Array<AppBskyEmbedImages.Image> = []

  // 動画
  let video: undefined | AppBskyEmbedVideo.Main
  const videoFileIndex = params.medias?.findIndex((media) => {
    return media.type?.startsWith("video/") ?? false
  }) ?? - 1

  // 動画ファイルがない場合
  if (videoFileIndex === - 1) {
    const fileBlobRefs: Array<Error | null | BlobRef> = await Promise.all(
      params.medias?.map((file: File): Promise<Error | null | BlobRef> => {
        return atp.createFileBlobRef({
          file,
          maxWidth: 2000,
          maxHeight: 2000,
          maxSize: 0.953671875,
        })
      }) ?? []
    )
    if (fileBlobRefs.some((fileBlobRef) => {
      return fileBlobRef instanceof Error || fileBlobRef == null
    })) {
      return Error("imageCompressionError")
    }

    // 画像サイズのアスペクト比（実際にはサイズ）を取得
    const aspectRatios: Array<undefined | TTAspectRatio> = []
    if (params.medias != null) {
      for (const file of params.medias) {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        try {
          await img.decode()
          aspectRatios.push({
            width: img.width,
            height: img.height,
          })
        } catch (error: any) {
          console.warn("[klearsky/createEmbed]", error)
          aspectRatios.push(undefined)
        }
      }
    }

    if (fileBlobRefs.length > 0) {
      const imageObjects = fileBlobRefs
        .map((fileBlobRef, index: number): null | AppBskyEmbedImages.Image => {
          if (fileBlobRef instanceof Error || fileBlobRef == null) {
            return null
          }
          const result: AppBskyEmbedImages.Image = {
            image: fileBlobRef,
            alt: params.alts?.[index] ?? "",
          }
          if (aspectRatios[index] != null) {
            result.aspectRatio = aspectRatios[index]
          }
          return result
        })
        .filter((image: null | AppBskyEmbedImages.Image) => {
          return image != null
        }) as Array<AppBskyEmbedImages.Image>
      if (imageObjects.length > 0) {
        images.splice(0, images.length, ...imageObjects)
      }
    }

  // 動画ファイルがある場合
  } else if (params.medias != null) {
    /*
    // PDSに直接アップロード
    // TODO: 不要であれば削除すること
    const file = params.medias[videoFileIndex]
    const videoBlob = await atp.createFileBlobRef({ file })
    if (videoBlob == null) {
      return Error("createFileBlobRefError")
    }
    video = {
      $type: "app.bsky.embed.video",
      video: videoBlob,
    }
    */

    const file = params.medias[videoFileIndex]
    const response = await atp.createVideo(file)
    if (response instanceof Error) {
      return response
    }
    video = {
      $type: "app.bsky.embed.video",
      video: response,
    }

    // 動画の alt を設定
    if (params.alts?.[videoFileIndex] != null) {
      video.alt = params.alts?.[videoFileIndex]
    }

    // 動画の aspectRatio を設定
    if ((file as any)._videoAspectRatio != null) {
      video.aspectRatio = (file as any)._videoAspectRatio
    }

    /*
    // 動画の字幕ファイルを設定
    // TODO: UIを実装すること
    if (params.captions?.[videoFileIndex] != null) {
      video.captions = params.captions?.[videoFileIndex]
    }
    */
  }

  // 引用リポスト
  if ((params.type === "quoteRepost" && params.post != null) || manualQuoteRepost != null) {
    const quotePost = params.type === "quoteRepost"
      ? params.post as TTPost
      : manualQuoteRepost as TTPost
    parent.embed = {
      $type: images.length > 0 || video != null || external != null
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
    if (images.length > 0)
      parent.embed.media = { $type: "app.bsky.embed.images", images }
    else if (video != null)
      parent.embed.media = video
    else if (external != null)
      parent.embed.media = { $type: "app.bsky.embed.external", external }
    else if (feedOrLinkOrStarterPackCard != null)
      parent.embed.media = feedOrLinkOrStarterPackCard
  }

  // 画像またはリンクカード
  if (params.type !== "quoteRepost" && manualQuoteRepost == null) {
    if (images.length > 0) {
      parent.embed = {
        $type: "app.bsky.embed.images",
        images,
      }
    } else if (video != null) {
      parent.embed = video
    } else if (external != null) {
      parent.embed = {
        $type: "app.bsky.embed.external",
        external,
      }
    } else if (feedOrLinkOrStarterPackCard != null) {
      parent.embed = feedOrLinkOrStarterPackCard
    }
  }
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

function convertStarterPackUriToAtUri (uri: string): null | string {
  const matches = uri.match(/^https?:\/\/[\w\.\-]+\/starter-pack\/(did:\w+:[\w\.\-]+)\/([\w\.\-]+)$/)
  if (matches?.[1] == null || matches?.[2] == null) return null
  const did = matches[1]
  const rkey = matches[2]
  return `at://${did}/app.bsky.graph.starterpack/${rkey}`
}
