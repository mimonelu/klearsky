import type { AppBskyFeedGetPosts } from "@atproto/api"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  uris: Array<string>
): Promise<Error | Array<TTPost>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  // 空配列はエラーとなるため却下
  if (uris.length === 0) {
    return []
  }

  const results: Array<TTPost> = []

  // 取得限度数対策
  // SEE: https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getPosts.json#L15
  const tasks = chunkArray(uris, CONSTS.LIMIT_OF_FETCH_POSTS)
    .map(async (uris: string[]) => {
      const query: AppBskyFeedGetPosts.QueryParams = { uris }
      return this.agent?.getPosts(query)
        .then((value) => value)
        .catch((error) => error)
    })
  const responses = await Promise.allSettled(tasks)
  responses.forEach((response: PromiseSettledResult<any>) => {
    console.log("[klearsky/getPosts]", response)
    if (response == null ||
        response.status === "rejected" ||
        response.value instanceof Error ||
        !response.value.success) {
      return
    }

    // TODO:
    Util.sanitizePostsOrFeeds(response.value.data.posts)

    results.push(...(response.value.data.posts as Array<TTPost>))
  })

  return results
}

function chunkArray (array: any[], chunkSize: number): any[] {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
