import type { AppBskyFeedGetPosts, BskyAgent } from "@atproto/api"
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default async function (
  this: TIAtpWrapper,
  uris: Array<string>
): Promise<undefined | false | Array<TTPost>> {
  if (this.agent == null) return
  if (this.session == null) return

  // 空配列はエラーとなるため却下
  if (uris.length === 0) return

  const query: AppBskyFeedGetPosts.QueryParams = { uris }
  const response: AppBskyFeedGetPosts.Response =
    await (this.agent as BskyAgent).getPosts(query)
      .then((value: AppBskyFeedGetPosts.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPosts]", response)
  if (!response.success) return false

  // TODO:
  AtpUtil.coherentResponses(response.data.posts)
  AtpUtil.detectLanguages(response.data.posts)

  return response.data.posts as Array<TTPost>
}
