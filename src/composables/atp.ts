import AtpAgent from "@atproto/api"
import type {
  AppBskyActorGetProfile,
  AppBskyActorProfile,
  AppBskyActorUpdateProfile,
  AppBskyEmbedImages,
  AppBskyFeedGetAuthorFeed,
  AppBskyFeedGetPostThread,
  AppBskyFeedGetTimeline,
  AppBskyFeedPost,
  AppBskyFeedSetVote,
  AtpSessionData,
  AtpSessionEvent,
  ComAtprotoBlobUpload,
  ComAtprotoSessionGet
} from "@atproto/api"
import type { Entity } from "@atproto/api/dist/client/types/app/bsky/feed/post.d"
import storage from "@/composables/storage"
import { getFileAsUint8Array } from "@/composables/misc"

export default class {
  service: null | string = null
  agent: null | AtpAgent = null
  session: null | AtpSessionData = null

  contsructor () {
    this.service = null
    this.agent = null
    this.session = null
  }

  setService (service?: string) {
    this.service = service ?? storage.load("service") ?? "https://bsky.social"
    storage.save("service", this.service)
  }

  createAgent (): boolean {
    try {
      this.agent = new AtpAgent({
        service: this.service as string,
        persistSession: (event: AtpSessionEvent, session?: AtpSessionData) => {
          switch (event) {
            case "create": {
              this.session = session ?? null
              break
            }
            case "create-failed": {
              this.logout()
              break
            }
            case "update": {
              this.session = session ?? null
              break
            }
            case "expired": {
              this.logout()
              break
            }
          }
        },
      })
      return this.agent != null
    } catch (error: any) {
      console.error(error)
      return false
    }
  }

  canLogin (): boolean {
    return storage.load("handle") != null
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
      console.error("[klearsky/login]", error)
      this.logout()
      return false
    }
    // ここで persistSession が入る
    if (this.session == null) return false
    storage.save("handle", this.session.handle)
    storage.save(this.session.handle, this.session)
    return true
  }

  logout () {
    storage.remove("handle")
    if (this.session != null) {
      storage.remove(this.session.handle)
      this.session = null
    }
  }

  async resumeSession (): Promise<boolean> {
    if (this.agent == null) return false
    const handle = storage.load("handle")
    if (handle == null) return false
    this.session = storage.load(handle)
    if (this.session == null) return false
    try {
      const response: ComAtprotoSessionGet.Response =
        await this.agent.resumeSession(this.session)
      return response.success
    } catch (error: any) {
      console.error("[klearsky/resumeSession]", error)
      return false
    }
  }

  async fetchProfile (actor: string): Promise<null | AppBskyActorProfile.View> {
    if (this.agent == null) return null
    if (this.session == null) return null
    try {
      const response: AppBskyActorGetProfile.Response =
        await this.agent.api.app.bsky.actor.getProfile({ actor })
      console.log("[klearsky/getProfile]", response)
      if (!response.success) return null
      return response.data
    } catch (error: any) {
      console.error("[klearsky/fetchProfile]", error)
      return null
    }
  }

  async fetchTimeline (oldFeeds: Array<Feed>, limit?: number, cursor?: string): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const query: AppBskyFeedGetTimeline.QueryParams = {
      // algorithm: "", // TODO: 要調査
    }
    if (limit != null) query.limit = limit
    if (cursor != null) query.before = cursor
    try {
      const response: AppBskyFeedGetTimeline.Response =
        await this.agent.api.app.bsky.feed.getTimeline(query)
      console.log("[klearsky/getTimeline]", response)
      if (!response.success) return null

      // TODO:
      const newFeeds = this.mergeFeeds(oldFeeds, response.data.feed as Array<Feed>)
      this.sortFeeds(newFeeds)
      return {
        feeds: newFeeds,
        cursor: response.data.cursor,
      }
    } catch (error: any) {
      console.error("[klearsky/fetchTimeline]", error)
      return null
    }
  }

  async fetchPostThread (uri: string, depth?: number): Promise<null | Array<Feed>> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const query: AppBskyFeedGetPostThread.QueryParams = { uri }
    if (depth != null) query.depth = depth
    try {
      const response: AppBskyFeedGetPostThread.Response =
        await this.agent.api.app.bsky.feed.getPostThread(query)
      console.log("[klearsky/getPostThread]", response)
      if (!response.success) return null

      // TODO:
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
    } catch (error: any) {
      console.error("[klearsky/fetchPostThread]", error)
      return null
    }
  }

  async fetchAuthorFeed (oldFeeds: Array<Feed>, author: string, limit?: number, cursor?: string): Promise<null | { feeds: Array<Feed>; cursor?: string }> {
    if (this.agent == null) return null
    if (this.session == null) return null
    const query: AppBskyFeedGetAuthorFeed.QueryParams = { author }
    if (limit != null) query.limit = limit
    if (cursor != null) query.before = cursor
    try {
      const response: AppBskyFeedGetAuthorFeed.Response =
        await this.agent.api.app.bsky.feed.getAuthorFeed(query)
      console.log("[klearsky/getAuthorFeed]", response)
      if (!response.success) return null

      // TODO:
      const newFeeds = this.mergeFeeds(oldFeeds, response.data.feed as Array<Feed>)
      this.sortFeeds(newFeeds)
      return {
        feeds: newFeeds,
        cursor: response.data.cursor,
      }
    } catch (error: any) {
      console.error("[klearsky/fetchAuthorFeed]", error)
      return null
    }
  }

  async fetchFileSchema (file: File): Promise<null | FileSchema> {
    if (this.agent == null) return null
    if (file == null) return null
    const data: null | Uint8Array = await getFileAsUint8Array(file)
    if (data == null) return null
    try {
      const response: ComAtprotoBlobUpload.Response =
        await this.agent.api.com.atproto.blob.upload(data, { encoding: file.type })
      console.log("[klearsky/fetchFileSchema]", response)
      if (!response.success) return null
      return {
        cid: response.data.cid,
        mimeType: file.type,
      }
    } catch (error: any) {
      console.error("[klearsky/fetchFileSchema]", error)
      return null
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
      // NOTICE: リポストの indexedAt はリポストした時の時間ではないため、
      // そのままソートするとリポストがポストされた時間でソートされてしまう。以下はその暫定的な対策
      if (a.post.viewer.repost != null || b.post.viewer.repost != null) return 0

      const aIndexedAt = new Date(a.post.indexedAt)
      const bIndexedAt = new Date(b.post.indexedAt)
      return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? - 1 : 0
    })
  }

  async updateProfile ({
    displayName,
    description,
    avatar,
    banner
  }: {
    displayName: string;
    description: string;
    avatar: null | Array<File>;
    banner: null | Array<File>;
  }): Promise<boolean> {
    if (this.agent == null) return false
    if (this.session == null) return false
    const fileSchemas: Array<null | FileSchema> = await Promise.all([
      avatar != null && avatar[0] != null ? this.fetchFileSchema(avatar[0]) : null,
      banner != null && banner[0] != null ? this.fetchFileSchema(banner[0]) : null,
    ])
    const avatarSchema: null | FileSchema = fileSchemas[0]
    const bannerSchema: null | FileSchema = fileSchemas[1]
    const profileSchema: AppBskyActorUpdateProfile.InputSchema = {
      displayName,
      description,
    }
    if (avatarSchema != null) profileSchema.avatar = avatarSchema
    if (bannerSchema != null) profileSchema.banner = bannerSchema
    try {
      const response: AppBskyActorUpdateProfile.Response =
        await this.agent?.api.app.bsky.actor.updateProfile(profileSchema) ?? null
      console.log("[klearsky/updateProfile]", response)
      return response.success
    } catch (error: any) {
      console.error("[klearsky/updateProfile]", error)
      return false
    }
  }

  async createRecord ({
    type,
    post,
    text,
    url,
    images,
    alts
  }: {
    type: "post" | "reply" | "repost";
    post?: any;
    text: string;
    url: string;
    images: Array<File>;
    alts: Array<string>;
  }): Promise<boolean> {
    if (this.agent == null) return false
    if (this.session == null) return false

    // TODO:
    if (type === "repost" && text === "") {
      return await this.createRepost(post)
    }

    const record: AppBskyFeedPost.Record = {
      createdAt: this.makeCreatedAt(),
      text,
    }

    // TODO:
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
    if (entities.length > 0) record.entities = entities

    // TODO:
    if (url?.length > 0) {
      record.embed = {
        $type: "app.bsky.embed.external",
        external: {
          uri: url,
          title: "",
          description: "",
        },
      }
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
      if (imageObjects.length > 0) {
        record.embed = {
          $type: "app.bsky.embed.images",
          images: imageObjects,
        }
      }
    }

    if (type === "reply") {
      record.reply = {
        // TODO: Feed.root == Feed.parent であればこれで良いが、でなければ誤り。要修正
        root: {
          cid: post?.cid,
          uri: post?.uri,
        },

        parent: {
          cid: post?.cid,
          uri: post?.uri,
        },
      }
    }

    if (type === "repost") {
      record.embed = {
        $type: "app.bsky.embed.record",
        record: {
          cid: post?.cid,
          uri: post?.uri,
        },
      }
    }

    try {
      const response =
        await this.agent.api.app.bsky.feed.post.create({ did: this.session.did }, record)
      console.log("[klearsky/createRecord]", response)
    } catch (error: any) {
      console.error("[klearsky/createRecord]", error)
      return false
    }
    return true
  }

  async createRepost (post?: any): Promise<boolean> {
    if (this.agent == null) return false
    if (this.session == null) return false
    try {
      const response = await this.agent.api.app.bsky.feed.repost.create({
        did: this.session.did,
      }, {
        subject: {
          cid: post?.cid,
          uri: post?.uri,
        },
        createdAt: this.makeCreatedAt(),
      })
      console.log("[klearsky/createRepost]", response)
      return true
    } catch (error: any) {
      console.error("[klearsky/createRepost]", error)
      return false
    }
  }

  async deleteRepost (uri: string): Promise<boolean> {
    if (this.agent == null) return false
    if (this.session == null) return false
    try {
      await this.agent.api.app.bsky.feed.repost.delete({
        did: this.session.did,
        rkey: uri.split("/").pop(),
      })
      return true
    } catch (error: any) {
      console.error("[klearsky/deleteRepost]", error)
      return false
    }
  }

  async updateVote (uri: string, cid: string, direction: "none" | "up" | "down"): Promise<boolean> {
    if (this.agent == null) return false
    if (this.session == null) return false
    try {
      const response: AppBskyFeedSetVote.Response =
        await this.agent.api.app.bsky.feed.setVote({
          subject: { uri, cid },
          direction,
        })
      return response.success
    } catch (error: any) {
      console.error("[klearsky/updateVote]", error)
      return false
    }
  }

  makeCreatedAt (): string {
    return (new Date()).toISOString()
  }
}
