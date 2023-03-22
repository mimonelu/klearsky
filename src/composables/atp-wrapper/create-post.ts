import type { AppBskyEmbedImages, AppBskyFeedPost } from "@atproto/api"
import { makeCreatedAt } from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  params: TTCreatePostParams
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false

  // TODO:
  if (params.type === "quoteRepost" && params.text === "") {
    return await this.createRepost(params.post)
  }

  const record: AppBskyFeedPost.Record = {
    createdAt: makeCreatedAt(),
    text: params.text,
  }

  // TODO:
  const entities: Array<TTEntity> = []
  const entityRegExps: { [k: string]: RegExp } = {
    // mention: new RegExp("(?:^|\\s)(@[\\w\\.\\-]+)", "g"),
    // hashtag: new RegExp("(?:^|\\s)(#\\w+)", "g"),
    link: new RegExp(
      "(?:^|\\s)(https?:\\/\\/[\\w/:%#\\$&\\?\\(\\)~\\.=\\+\\-]+)",
      "g"
    ),
  }
  for (const type in entityRegExps) {
    const regexp: RegExp = entityRegExps[type]
    while (true) {
      const current = regexp.exec(params.text)
      if (current == null) break
      entities.push({
        index: {
          start: current.index + 1,
          end: current.index + 1 + current[1].length,
        },
        type,
        value: current[1],
      })
    }
  }
  if (entities.length > 0) record.entities = entities

  // TODO:
  if (params.url?.length > 0) {
    record.embed = {
      $type: "app.bsky.embed.external",
      external: {
        uri: params.url,
        title: "",
        description: "",
      },
    }
  }

  const fileSchemas: Array<null | TTFileSchema> = await Promise.all(
    params.images.map((file: File): Promise<null | TTFileSchema> => {
      return this.createFileSchema(file, 2000, 2000)
    })
  )
  if (fileSchemas.length > 0) {
    const imageObjects: Array<null | AppBskyEmbedImages.Image> = fileSchemas
      .map(
        (
          fileSchema: null | TTFileSchema,
          index: number
        ): null | AppBskyEmbedImages.Image => {
          return fileSchema == null
            ? null
            : {
                image: fileSchema,
                alt: params.alts[index] ?? "",
              }
        }
      )
      .filter((image: null | AppBskyEmbedImages.Image) => image != null)
    if (imageObjects.length > 0) {
      record.embed = {
        $type: "app.bsky.embed.images",
        images: imageObjects,
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
    record.embed = {
      $type: "app.bsky.embed.record",
      record: {
        cid: params.post?.cid,
        uri: params.post?.uri,
      },
    }
  }

  const response = await this.agent.api.app.bsky.feed.post.create(
    { did: this.session.did },
    record
  )
  console.log("[klearsky/createRecord]", response)
  return true
}
