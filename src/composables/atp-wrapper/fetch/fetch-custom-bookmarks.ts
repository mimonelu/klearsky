import Util from "@/composables/util"
import { THIRD_PARTY_DOMAIN_BOOKMARK } from "@/consts/consts.json"

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

  // カスタムブックマークの取得
  const records = await this.fetchRecords(
    did,
    THIRD_PARTY_DOMAIN_BOOKMARK,
    limit,
    cursor
  )
  if (records instanceof Error) {
    return records
  }

  // カスタムブックマークポストの取得
  const customBookmarkUris = records.records.map((record) => {
    return record.value.uri
  }) as Array<string>

  const posts = await this.fetchPosts(customBookmarkUris)
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
