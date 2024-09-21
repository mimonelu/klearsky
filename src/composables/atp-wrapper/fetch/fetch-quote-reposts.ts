import type { AppBskyFeedGetQuotes } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  currentPosts: Array<TTPost>,
  uri: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetQuotes.QueryParams = {
    uri,
    limit,
    cursor,
  }
  const response: Error | AppBskyFeedGetQuotes.Response =
    await this.agent.app.bsky.feed.getQuotes(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getQuotes]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // TODO:
  Util.sanitizePostsOrFeeds(response.data.posts)

  // ブロックユーザーを除去
  response.data.posts = (response.data.posts as Array<TTPost>)
    .filter((post) => {
      return !post.viewer?.blocking && !post.viewer?.blockedBy
    })

  // 他ユーザーの切り離されたポストを除去
  response.data.posts = (response.data.posts as Array<TTPost>)
    .filter((post) => {
      return (
        post.author.did === this.session?.did ||
        !post.embed?.record?.detached ||
        post.embed?.record?.uri?.startsWith(`at://${this.session?.did}/`)
      )
    })

  const newPosts: Array<TTPost> = []
  ;(response.data.posts as Array<TTPost>).forEach((newPost) => {
    if (!currentPosts.some((currentPost) => {
      return currentPost.uri === newPost.uri
    })) {
      newPosts.push(newPost)
    }
  })
  if (cursor == null) {
    currentPosts.unshift(...newPosts)
  } else {
    currentPosts.push(...newPosts)
  }
  return response.data.cursor
}
