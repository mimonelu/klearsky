import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  currentPosts: Array<TTPost>,
  did: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  const records = await this.fetchRecords(
    did,
    "net.mimonelu.klearsky.postBookmark",
    limit,
    cursor
  )
  if (records instanceof Error) {
    return records
  }

  const postBookmarkUris = records.records.map((record) => {
    return record.value.uri
  }) as Array<string>

  const posts = await this.fetchPosts(postBookmarkUris)
  if (posts instanceof Error) {
    return posts
  }

  // TODO:
  Util.sanitizePostsOrFeeds(posts)

  const newPosts: Array<TTPost> = []
  ;(posts as Array<TTPost>).forEach((newPost) => {
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
  return records.cursor
}
