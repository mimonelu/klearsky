import Util from "@/composables/util"
import { THIRD_PARTY_DOMAIN_BOOKMARK } from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  currentCustomBookmarkPacks: Array<TICustomBookmarkPack>,
  did: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
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
  const newCustomBookmarks = records.records.map((record) => {
    return record.value
  }) as Array<TICustomBookmark>

  // カスタムブックマークポストの取得
  const newCustomBookmarkUris = records.records.map((record) => {
    return record.value.uri
  }) as Array<string>
  const newCustomBookmarkPosts = await this.fetchPosts(newCustomBookmarkUris)
  if (newCustomBookmarkPosts instanceof Error) {
    return newCustomBookmarkPosts
  }

  // TODO:
  Util.sanitizePostsOrFeeds(newCustomBookmarkPosts)

  // カスタムブックマークパックの作成
  const newCustomBookmarkPacks: Array<TICustomBookmarkPack> =
    newCustomBookmarks.map((bookmark) => {
      const post = newCustomBookmarkPosts.find((post) => {
        return post.uri === bookmark.uri
      })
      return {
        bookmark,
        post,
      }
    })

  const addingCustomBookmarkPacks: Array<TICustomBookmarkPack> = []
  newCustomBookmarkPacks.forEach((newPack) => {
    if (!currentCustomBookmarkPacks.some((currentPack) => {
      return currentPack.bookmark.uri === newPack.bookmark.uri
    })) {
      addingCustomBookmarkPacks.push(newPack)
    }
  })
  if (cursor == null) {
    currentCustomBookmarkPacks.unshift(...addingCustomBookmarkPacks)
  } else {
    currentCustomBookmarkPacks.push(...addingCustomBookmarkPacks)
  }
  return records.cursor
}
