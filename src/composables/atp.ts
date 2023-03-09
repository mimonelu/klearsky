import AtpAgent from "@atproto/api"
import type {
  AppBskyActorGetProfile,
  AppBskyActorUpdateProfile,
  // AppBskyEmbedExternal,
  AppBskyEmbedImages,
  // AppBskyEmbedRecord,
  AppBskyFeedGetAuthorFeed,
  AppBskyFeedGetPostThread,
  AppBskyFeedGetTimeline,
  AppBskyFeedPost,
  AtpSessionData,
  AtpSessionEvent,
  ComAtprotoBlobUpload,
  ComAtprotoSessionGet
} from "@atproto/api"
import type { Entity } from "@atproto/api/dist/client/types/app/bsky/feed/post.d"
import { getFileAsUint8Array } from "@/composables/misc"
import type { Feed, FileSchema, Profile } from "@/@types/atp.d"

export default class {
  service: null | string = null
  agent: null | AtpAgent = null
  session: null | AtpSessionData = null

  contsructor () {
    this.service = null
    this.agent = null
    this.session = null
  }

  createAgent (service?: string): boolean {
    if (service == null) {
      if (this.service == null) {
        this.service = localStorage.getItem("service")
        if (this.service == null) this.service = "https://bsky.social"
      }
    } else {
      this.service = service
    }
    localStorage.setItem("service", this.service)
    this.agent = new AtpAgent({
      service: this.service,
      persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
        if (event !== "create" && event !== "update") return
        this.session = session ?? null
      },
    })
    return this.agent != null
  }

  canLogin (): boolean {
    return localStorage.getItem("session") != null
  }

  hasLogin (): boolean {
    return this.session != null
  }

  async login (identifier?: string, password?: string): Promise<boolean> {
    if (this.agent == null) return false
    try {
      if (identifier == null || password == null) await this.resumeSession()
      else await this.agent.login({ identifier, password })
    } catch (error: any) {
      localStorage.removeItem("session")
      return false
    }
    if (this.session == null) return false
    this.saveSessionData()
    return true
  }

  async resumeSession (): Promise<boolean> {
    if (this.agent == null) return false
    this.loadSessionData()
    if (this.session == null) return false
    const response: ComAtprotoSessionGet.Response = await this.agent.resumeSession(this.session)
    return response.success
  }

  saveSessionData () {
    if (this.session == null) return null
    const string = JSON.stringify(this.session)
    localStorage.setItem("session", string)
  }

  loadSessionData () {
    const string: null | string = localStorage.getItem("session")
    if (string == null) {
      this.session = null
      return
    }
    this.session = JSON.parse(string)
  }

  async fetchProfile (actor: string): Promise<Profile> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const response: AppBskyActorGetProfile.Response = await this.agent.api.app.bsky.actor.getProfile({
      actor,
    })
    console.log("getProfile", response)
    if (!response.success) return null
    return response.data
  }

  async fetchTimeline (oldFeeds: Array<Feed>, limit: number, cursor?: string): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const response: AppBskyFeedGetTimeline.Response =
      await this.agent.api.app.bsky.feed.getTimeline({
        // algorithm: "", // TODO: 要調査
        limit,
        before: cursor,
      })
    console.log("getTimeline", response)
    if (!response.success) return null
    const newFeeds = this.mergeFeeds(oldFeeds, response.data.feed)
    this.sortFeeds(newFeeds)
    return {
      feeds: newFeeds,
      cursor: response.data.cursor,
    }
  }

  async fetchPostThread (uri: string, depth?: number): Promise<null | Array<Feed>> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const response: AppBskyFeedGetPostThread.Response =
      await this.agent.api.app.bsky.feed.getPostThread({ uri, depth })
    console.log("getPostThread", response)
    if (!response.success) return null

    const posts: Array<any> = [
      response.data.thread.post,
      ...(response.data.thread.replies as Array<any>).map((reply: any): any => reply.post)
    ]
    posts.sort((a: any, b: any) => {
      const aIndexedAt = new Date(a.indexedAt)
      const bIndexedAt = new Date(b.indexedAt)
      return aIndexedAt > bIndexedAt ? 1 : aIndexedAt < bIndexedAt ? - 1 : 0
    })

    return posts.map((post: any) => ({ post }))
  }

  async fetchAuthorFeed (oldFeeds: Array<Feed>, author: string, limit?: number, cursor?: string): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const response: AppBskyFeedGetAuthorFeed.Response =
      await this.agent.api.app.bsky.feed.getAuthorFeed({ author, limit, before: cursor })
    console.log("getAuthorFeed", response)
    if (!response.success) return null
    const newFeeds = this.mergeFeeds(oldFeeds, response.data.feed)
    this.sortFeeds(newFeeds)
    return {
      feeds: newFeeds,
      cursor: response.data.cursor,
    }
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

  mergeFeeds (oldFeeds: null | Array<Feed>, targetFeeds: Array<Feed>): Array<Feed> {
    const newFeeds: Array<Feed> = oldFeeds != null ? [...oldFeeds] : []
    targetFeeds.forEach((newFeed: Feed) => {
      const oldFeedIndex: number = newFeeds.findIndex((oldFeed: Feed) =>
        oldFeed.post.cid === newFeed.post.cid)
      if (oldFeedIndex === - 1) {
        newFeeds.push(newFeed)
      } else {
        newFeeds[oldFeedIndex] = newFeed
      }
    })
    return newFeeds
  }

  sortFeeds (feeds: Array<Feed>): Array<Feed> {
    return feeds.sort((a: Feed, b: Feed) => {
      const aIndexedAt = new Date(a.post.indexedAt)
      const bIndexedAt = new Date(b.post.indexedAt)
      return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? - 1 : 0
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
    if (!this.createAgent(service)) return false
    if (!await this.login(identifier, password)) return false

    if (this.session == null) return false
    const profile = await this.fetchProfile(this.session.did)
    if (profile == null) return false

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

    const response: null | AppBskyActorUpdateProfile.Response =
      await this.agent?.api.app.bsky.actor.updateProfile(profileSchema) ?? null

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

    const entities: Array<Entity> = []
    const entityRegExps: { [k: string]: RegExp } = {
      // mention: new RegExp("(?:^|\\s)(@[\\w\\.\\-]+)", "g"),
      // hashtag: new RegExp("(?:^|\\s)(#\\w+)", "g"),
      link: new RegExp("(?:^|\\s)(https?:\\/\\/[\\w/:%#\\$&\\?\\(\\)~\\.=\\+\\-]+)", "g"),
    }
    for (const type in entityRegExps) {
      const regexp: RegExp = entityRegExps[type]
      while (true) {
        const current = regexp.exec(text)
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
    console.log(entities)

    const record: AppBskyFeedPost.Record = {
      createdAt: this.makeCreatedAt(),
      entities,
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

  makeCreatedAt (): string {
    return (new Date()).toISOString()
  }
}
