import type { AppBskyFeedGetQuotes, AtpAgent } from "@atproto/api"

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
    await (this.agent as AtpAgent).app.bsky.feed.getQuotes(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getQuotes]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  /*
  // ブロックユーザーをフィルタリング
  response.data.repostedBy = (response.data.repostedBy as Array<TTPost>).filter((post: TTPost) => {
    return !post.viewer?.blocking && !post.viewer?.blockedBy
  })
  */

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
