import AtpAgent from "@atproto/api"
import type {
  AppBskyActorUpdateProfile,
  // AppBskyEmbedExternal,
  AppBskyEmbedImages,
  // AppBskyEmbedRecord,
  AppBskyFeedPost,
  AtpSessionData,
  AtpSessionEvent,
  ComAtprotoBlobUpload
} from "@atproto/api"
import { getFileAsUint8Array } from "@/composables/misc"

export default class {
  agent: null | AtpAgent = null
  session: null | AtpSessionData = null

  contsructor () {
    this.agent = null
    this.session = null
  }

  createAgent (service: string) {
    this.agent = new AtpAgent({
      service,
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        if (event !== "create" && event !== "update") return
        this.session = session ?? null
      },
    })
  }

  async updateProfile ({
    service,
    identifier,
    password,
    avatar,
    banner
  }: {
    service: string
    identifier: string
    password: string
    avatar: null | File
    banner: null | File
  }): Promise<boolean> {
    this.createAgent(service)
    if (this.agent == null) return false

    await this.agent.login({ identifier, password })
    if (this.session == null) return false

    const profile = (await this.agent.api.app.bsky.actor.getProfile({
      actor: this.session.did,
    })).data

    const fileSchemas: Array<null | FileSchema> = await Promise.all([
      avatar != null ? this.fetchFileSchema(avatar) : null,
      banner != null ? this.fetchFileSchema(banner) : null,
    ])

    const avatarSchema: null | FileSchema = fileSchemas[0]
    const bannerSchema: null | FileSchema = fileSchemas[1]

    const profileSchema: AppBskyActorUpdateProfile.InputSchema = {
      displayName: profile.displayName,
      description: profile.description,
    }
    if (avatarSchema != null) profileSchema.avatar = avatarSchema
    if (bannerSchema != null) profileSchema.banner = bannerSchema

    const response: AppBskyActorUpdateProfile.Response =
      await this.agent.api.app.bsky.actor.updateProfile(profileSchema)

    return response?.success ?? false
  }

  async postRecord ({
    service,
    identifier,
    password,
    text,
    images,
    alts
  }: {
    service: string
    identifier: string
    password: string
    text: string
    images: Array<File>
    alts: Array<string>
  }): Promise<boolean> {
    this.createAgent(service)
    if (this.agent == null) return false
    await this.agent.login({ identifier, password })
    if (this.session == null) return false

    const record: AppBskyFeedPost.Record = {
      createdAt: this.makeCreatedAt(),
      text,
    }

    const fileSchemas: Array<null | FileSchema> =
      await Promise.all(images.map((file: File): Promise<null | FileSchema> => {
        return this.fetchFileSchema(file)
      }))
    if (fileSchemas.length > 0) {
      const imageObjects: Array<null | AppBskyEmbedImages.Image> = fileSchemas
        .map((fileSchema: null | FileSchema, index: number): null | AppBskyEmbedImages.Image => {
          return fileSchema == null ? null : {
            image: fileSchema,
            alt: alts[index] ?? "",
          }
        })
        .filter((image: null | AppBskyEmbedImages.Image) => image != null)
      record.embed = {
        $type: "app.bsky.embed.images",
        images: imageObjects,
      }
    }

    await this.agent.api.app.bsky.feed.post.create({ did: this.session.did }, record)

    return true
  }

  async fetchFileSchema (file: File): Promise<null | FileSchema> {
    if (this.agent == null) return null
    if (file == null) return null
    const data: null | Uint8Array = await getFileAsUint8Array(file)
    if (data == null) return null
    const response: ComAtprotoBlobUpload.Response =
      await this.agent.api.com.atproto.blob.upload(data, { encoding: file.type })
    return {
      cid: response.data.cid,
      mimeType: file.type,
    }
  }

  makeCreatedAt (): string {
    return (new Date()).toISOString()
  }
}
