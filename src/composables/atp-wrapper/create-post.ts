import { RichText } from "@atproto/api"
import type {
  AppBskyEmbedImages,
  AppBskyFeedPost,
  BlobRef,
  BskyAgent,
  ComAtprotoRepoCreateRecord
} from "@atproto/api"
import { makeCreatedAt } from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<boolean> {
  if (this.agent == null) return false

  const richText = new RichText({ text: params.text })
  await richText.detectFacets(this.agent)

  const record: AppBskyFeedPost.Record = {
    $type: "app.bsky.feed.post",
    createdAt: makeCreatedAt(),
    text: richText.text,
    facets: richText.facets,
  }

  // TODO:
  let external: null | any = null
  if (params.url?.length > 0) {
    const response = await fetch(
      `https://mimonelu.net:4649/${params.url}`,
      { headers: { "user-agent": "Klearsky" } }
    )
    const htmlString: string = await response.text()
    const parser = new DOMParser()
    const html = parser.parseFromString(htmlString, "text/html")
    const titleElement = html.querySelector("title")
    const descriptionElement = html.querySelector("meta[name='description']")
    const title = titleElement?.innerHTML ?? ""
    const description = descriptionElement?.getAttribute("content") ?? ""
    external = {
      uri: params.url,
      title,
      description,
    }
    record.embed = {
      $type: "app.bsky.embed.external",
      external,
    }
  }

  // TODO:
  let images: null | any = null
  const fileBlobRefs: Array<null | BlobRef> = await Promise.all(
    params.images.map((file: File): Promise<null | BlobRef> => {
      return this.createFileBlob({
        file,
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 1000000,
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
    if (imageObjects.length > 0) {
      images = imageObjects
      record.embed = {
        $type: "app.bsky.embed.images",
        images,
      }
    }
  }

  if (params.type === "reply" && params.post != null) {
    record.reply = {
      // TODO: Feed.root == Feed.parent であればこれで良いが、でなければ誤り。要修正
      root: {
        cid: params.post.cid,
        uri: params.post.uri,
      },

      parent: {
        cid: params.post.cid,
        uri: params.post.uri,
      },
    }
  }

  if (params.type === "quoteRepost") {
    record.embed ={
      $type: "app.bsky.embed.record",
      record: {
        cid: params.post?.cid,
        uri: params.post?.uri,
      },
      media: {},
    }
    if (external != null) {
      (record.embed.media as any).external = external
    }
    if (images != null) {
      (record.embed.media as any).images = images
    }
  }

  const response: ComAtprotoRepoCreateRecord.OutputSchema =
    await (this.agent as BskyAgent).post(record)
  console.log("[klearsky/post]", response)
  return true
}
