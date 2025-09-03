import Util from "@/composables/util"
import { THIRD_PARTY_DOMAIN_BOOKMARK } from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  currentBookmarkPacks: Array<TIBookmarkPack>,
  did: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  // ブックマークの取得
  const records = await this.fetchRecords(
    did,
    THIRD_PARTY_DOMAIN_BOOKMARK,
    limit,
    cursor
  )
  if (records instanceof Error) {
    return records
  }
  const newBookmarks = records.records.map((record) => {
    return record.value
  }) as Array<TIBookmark>

  // ブックマークポストの取得
  const newBookmarkUris = records.records.map((record) => {
    return record.value.uri
  }) as Array<string>
  const newBookmarkPosts = await this.fetchPosts(newBookmarkUris)
  if (newBookmarkPosts instanceof Error) {
    return newBookmarkPosts
  }

  // TODO:
  Util.sanitizePostsOrFeeds(newBookmarkPosts)

  // ブックマークパックの作成
  const newBookmarkPacks: Array<TIBookmarkPack> =
    newBookmarks.map((bookmark) => {
      const post = newBookmarkPosts.find((post) => {
        return post.uri === bookmark.uri
      })
      return {
        bookmark,
        post,
      }
    })

  const addingBookmarkPacks: Array<TIBookmarkPack> = []
  newBookmarkPacks.forEach((newPack) => {
    if (!currentBookmarkPacks.some((currentPack) => {
      return currentPack.bookmark.uri === newPack.bookmark.uri
    })) {
      addingBookmarkPacks.push(newPack)
    }
  })
  if (cursor == null) {
    currentBookmarkPacks.unshift(...addingBookmarkPacks)
  } else {
    currentBookmarkPacks.push(...addingBookmarkPacks)
  }
  return records.cursor
}
