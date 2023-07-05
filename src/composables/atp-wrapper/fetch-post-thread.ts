import type { AppBskyFeedGetPostThread, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  depth?: number
): Promise<undefined | false | Array<TTPost>> {
  if (this.agent == null) return
  const query: AppBskyFeedGetPostThread.QueryParams = { uri }
  if (depth != null) query.depth = depth
  const response: AppBskyFeedGetPostThread.Response =
    await (this.agent as BskyAgent).getPostThread(query)
      .then((value: AppBskyFeedGetPostThread.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPostThread]", response)
  if (!response.success) return false

  // TODO:
  const posts: Array<TTPost> = []
  AtpUtil.traverseJson(response.data.thread, (key: string, value: any) => {
    if (key === "post") posts.push(value)
  })
  AtpUtil.coherentResponses(posts)
  posts.sort((a: TTPost, b: TTPost) => {
    const aIndexedAt = new Date(a.__custom.reason?.indexedAt ?? a.indexedAt)
    const bIndexedAt = new Date(b.__custom.reason?.indexedAt ?? b.indexedAt)
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })
  posts.reverse()

  return posts
}
