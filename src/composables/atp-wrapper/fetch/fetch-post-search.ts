import type { AppBskyFeedSearchPosts } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  currentPosts: Array<TTPost>,
  q: string,
  params: TIPostSearch,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedSearchPosts.QueryParams = { q }
  if (params.sort != null) {
    query.sort = params.sort
  }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }

  if (params.lang) {
    query.q += ` lang:${params.lang}`
  }
  if (params.author) {
    query.q += ` from:${params.author}`
  }
  if (params.to) {
    query.q += ` to:${params.to}`
  }
  if (params.mentions) {
    query.q += ` mentions:${params.mentions}`
  }
  if (params.domain) {
    query.q += ` domain:${params.domain}`
  }
  if (params.since) {
    query.q += ` since:${params.since}`
  }
  if (params.until) {
    query.q += ` until:${params.until}`
  }

  const response: Error | AppBskyFeedSearchPosts.Response =
    await this.agent.app.bsky.feed.searchPosts(query)
      .then((value) => value)
      .catch((error) => error)
  $log("searchPosts", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  const newPosts: Array<TTPost> = (response.data.posts as Array<TTPost>)
    .filter((post: TTPost) => {
      return currentPosts.every((currentPost: TTPost) => {
        return currentPost.uri !== post.uri
      })
    })

  // TODO:
  Util.sanitizePostsOrFeeds(newPosts)

  if (cursor == null) {
    currentPosts.unshift(...newPosts)
  } else {
    currentPosts.push(...newPosts)
  }
  return response.data.cursor
}
