import type { AppBskyBookmarkGetBookmarks } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  currentOfficialBookmarks: Array<TTPost>,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: AppBskyBookmarkGetBookmarks.QueryParams = {}
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | AppBskyBookmarkGetBookmarks.Response =
    await this.agent.app.bsky.bookmark.getBookmarks(query)
      .then((value) => value)
      .catch((error) => error)
  $log("getBookmarks", response)
  if (response instanceof Error) {
    return response
  }
  if (response.data?.bookmarks == null) {
    return Error("apiError")
  }
  const addingOfficialBookmarks: Array<TTPost> = []
  response.data.bookmarks.forEach((bookmark) => {
    const newPost = bookmark.item as unknown as undefined | TTPost
    if (newPost?.uri == null) {
      return
    }
    if (!currentOfficialBookmarks.some((currentOfficialBookmark) => {
      return currentOfficialBookmark.uri === newPost.uri
    })) {
      Util.sanitizePostsOrFeeds([newPost])
      addingOfficialBookmarks.push(newPost)
    }
  })
  if (cursor == null) {
    currentOfficialBookmarks.unshift(...addingOfficialBookmarks)
  } else {
    currentOfficialBookmarks.push(...addingOfficialBookmarks)
  }
  return response.data.cursor
}
