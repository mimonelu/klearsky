import type { AppBskyBookmarkDeleteBookmark } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: AppBskyBookmarkDeleteBookmark.InputSchema = { uri }
  const response: Error | AppBskyBookmarkDeleteBookmark.Response =
    await this.agent.app.bsky.bookmark.deleteBookmark(query)
      .then((value) => value)
      .catch((error) => error)
  $log("deleteBookmark", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
