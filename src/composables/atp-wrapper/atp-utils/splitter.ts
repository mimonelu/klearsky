const protocol = "https?:\\/\\/"
const urlString =
  "[" +
  [
    "\\x21",
    "\\x23-\\x26",
    "\\x2b-\\x3b",
    "\\x3d",
    "\\x3f-\\x5a",
    "\\x5f",
    "\\x61-\\x7a",
    "\\x7e",
  ].join() +
  "]"
const tagString = "[^\\s\\(\\)\\[\\]]"
const pattern: { [k: string]: string } = {
  url: `(${protocol}${urlString}+)`,
  tag: `(^|\\s)(#${tagString}+)`,
  mention: `(^|\\s)(@[\\w\\-]+\\.[\\w\\-\\.]+)`,
}

export default (text: string): { [k: string]: any } => {
  const regexAll = new RegExp(`${pattern.mention}|${pattern.tag}|${pattern.url}`, "g")
  const result = text
    .split(regexAll)
    .filter(value => !!value)
    .map(value => {
      const regexMention = new RegExp(pattern.mention, "g")
      if (regexMention.test(value)) {
        return { type: "mention", value }
      }
      const regexTag = new RegExp(pattern.tag, "g")
      if (regexTag.test(value)) {
        return { type: "tag", value }
      }
      const regexUrl = new RegExp(pattern.url, "g")
      if (regexUrl.test(value)) {
        return { type: "url", value }
      }
      return { type: "text", value }
    })
  return result
}
