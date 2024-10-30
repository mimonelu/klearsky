import type { Facet } from "@atproto/api"
import { RichText } from "@atproto/api"

export default {
  includes (
    text?: string,
    originWordMutes?: Array<TIWordMute>,
    facets?: Array<Facet>,
    isFollowee?: boolean
  ): boolean {
    if (!text ||
        !originWordMutes?.length
    ) {
      return false
    }

    const wordMutes = originWordMutes.filter((wordMute) => {
      return wordMute.enabled[0] &&
        wordMute.keyword !== "" &&
        (wordMute.targets?.length ?? 0) > 0 &&
        (
          !isFollowee ||
          (isFollowee && !wordMute.actorTarget?.includes("exclude-following"))
        )
    })
    if (wordMutes.length === 0) {
      return false
    }

    const targetUrls: Array<string> = []
    const targetTags: Array<string> = []
    const targetContents: Array<string> = []

    const richText = new RichText({ text, facets })
    if (facets == null) {
      richText.detectFacetsWithoutResolution()
    }
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
}
