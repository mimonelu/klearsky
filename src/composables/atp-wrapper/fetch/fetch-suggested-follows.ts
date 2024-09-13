import type { AppBskyGraphGetSuggestedFollowsByActor } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  actor: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphGetSuggestedFollowsByActor.QueryParams = { actor }
  const response: Error | AppBskyGraphGetSuggestedFollowsByActor.Response =
    await this.agent.app.bsky.graph.getSuggestedFollowsByActor(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getSuggestedFollowsByActor]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  ;(response.data.suggestions as Array<TTUser>)
    // ブロックユーザーをフィルタリング
    .filter((follow: TTUser) => {
      return !follow.viewer?.blocking && !follow.viewer?.blockedBy
    })

    .forEach((following: TTUser) => {
      if (!users.some((user: TTUser) => user.did === following.did)) {
        users.push(following)
      }
    })
}
