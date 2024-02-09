import type { AppBskyFeedGetPosts, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"
import CONSTS from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  uris: Array<string>
): Promise<undefined | false | Array<TTPost>> {
  if (this.agent == null) return
  if (this.session == null) return

  // 空配列はエラーとなるため却下
  if (uris.length === 0) return

  const results: Array<TTPost> = []

  // 取得限度数対策
  // SEE: https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/getPosts.json#L15
  const tasks = chunkArray(uris, CONSTS.LIMIT_OF_FETCH_POSTS)
    .map(async (uris: string[]) => {
      const query: AppBskyFeedGetPosts.QueryParams = { uris }
      return (this.agent as BskyAgent).getPosts(query)
        .then((value: AppBskyFeedGetPosts.Response) => value)
        .catch((error: any) => error)
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
    AtpUtil.coherentResponses(response.value.data.posts)

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
