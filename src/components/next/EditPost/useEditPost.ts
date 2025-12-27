import { differenceInMinutes } from "date-fns"
import CONSTS from "@/consts/consts.json"

export function useEditPost (post?: TTPost, did?: string) {
  function canEditPost (): boolean {
    if (post == null) {
      return false
    }

    // 自分のポストでなければ編集不可
    if (post.author.did !== did) {
      return false
    }

    // 投稿から指定時間以内のみ編集可能
    const createdAt = new Date(post.record.createdAt)
    const minutesPassed = differenceInMinutes(new Date(), createdAt)
    return minutesPassed < CONSTS.EDIT_POST_TIME_LIMIT_MINUTES
  }

  return {
    canEditPost,
  }
}
