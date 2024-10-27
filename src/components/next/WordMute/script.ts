export default {
  includes (text?: string, wordMutes?: Array<TIWordMute>): boolean {
    if (!text ||
        !wordMutes?.length
    ) {
      return false
    }
    const adjustedText = text.toLowerCase()
    return wordMutes.some((wordMute) => {
      if (!wordMute.enabled[0] ||
          wordMute.keyword === ""
      ) {
        return false
      }
      return wordMute.keyword
        .toLowerCase()
        .split(",")
        .some((keyword: string) => {
          keyword = keyword.trim()
          return keyword !== "" && adjustedText.indexOf(keyword) !== - 1
        })
    })
  },
}
