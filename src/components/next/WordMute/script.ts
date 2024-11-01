import { RichText } from "@atproto/api"
import isBefore from "date-fns/isBefore"

export default {
  includes (
    richText: RichText,
    originWordMutes?: Array<TIWordMute>,
    isFollowee?: boolean
  ): boolean {
    if (!originWordMutes?.length) {
      return false
    }

    const dateNow = new Date()
    const wordMutes = originWordMutes.filter((wordMute) => {
      return wordMute.enabled[0] &&
        wordMute.keyword !== "" &&
        (wordMute.targets?.length ?? 0) > 0 &&
        (
          !isFollowee ||
          !wordMute.actorTarget?.includes("exclude-following")
        ) &&
        !this.expired(dateNow, wordMute.expiresAt)
    })
    if (wordMutes.length === 0) {
      return false
    }

    const targetUrls: Array<string> = []
    const targetTags: Array<string> = []
    const targetContents: Array<string> = []

    for (const segment of richText.segments()) {
      if (segment.isLink()) {
        // リンクのテキスト部分はスキップ（カスタムリンクのテキスト部分は対象外）
        targetUrls.push((segment.link?.uri ?? "").toLowerCase())
        continue
      }
      if (segment.isMention()) {
        // メンションはスキップ
        continue
      }
      if (segment.isTag()) {
        // ハッシュタグのテキスト部分はスキップ
        targetTags.push((segment.tag?.tag ?? "").toLowerCase())
        continue
      }
      targetContents.push(segment.text.toLowerCase())
    }

    return wordMutes.some((wordMute) => {
      return wordMute.keyword
        .toLowerCase()
        .split(",")
        .some((keyword: string) => {
          keyword = keyword.trim()
          if (keyword === "") {
            return false
          }
          return wordMute.targets!.some((target) => {
            if (target === "tag") {
              if (targetTags.some((tag) => {
                return tag.indexOf(keyword) !== - 1
              })) {
                return true
              }
            }
            if (target === "url") {
              if (targetUrls.some((url) => {
                return url.indexOf(keyword) !== - 1
              })) {
                return true
              }
            }
            if (target === "content") {
              if (targetContents.some((content) => {
                return content.indexOf(keyword) !== - 1
              })) {
                return true
              }
            }
            return false
          })
        })
    })
  },

  expired (dateNow: Date, expiresAt?: string): boolean {
    if (expiresAt == null) {
      return false
    }
    return !isBefore(dateNow, new Date(expiresAt))
  }
}
