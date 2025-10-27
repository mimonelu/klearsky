import type { AppBskyBookmarkCreateBookmark } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: AppBskyBookmarkCreateBookmark.InputSchema = {
    uri,
    cid,
  }
  const response: Error | AppBskyBookmarkCreateBookmark.Response =
    await this.agent.app.bsky.bookmark.createBookmark(query)
      .then((value) => value)
      .catch((error) => error)
  $log("createBookmark", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
