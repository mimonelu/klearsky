const protocol  = "https?:\\/\\/"
const urlString = "[" + [
  "\\x21",
  "\\x23-\\x26",
  "\\x2b-\\x3b",
  "\\x3d",
  "\\x3f-\\x5a",
  "\\x5f",
  "\\x61-\\x7a",
  "\\x7e"
].join() + "]"
const tagString = "[^\\s\\(\\)\\[\\]]"
const pattern: { [k: string]: string } = {
  url: `(${protocol}${urlString}+)`,
  tag: `((?<=^|\\s)#${tagString}+)`,
  mention: `((?<=^|\\s)@[\\w\\.]+)`,
}

const regex: { [k: string]: RegExp } = {
  url: new RegExp(pattern.url, "g"),
  tag: new RegExp(pattern.tag, "g"),
  mention: new RegExp(pattern.mention, "g"),
  all: new RegExp(`${pattern.mention}|${pattern.tag}|${pattern.url}`, "g"),
}

export default (text: string): { [k: string]: any } => text
  .split(regex.all)
  .filter(data => !!data)
  .map(data => {
    const type = regex.mention.test(data)
      ? "mention"
      : regex.tag.test(data)
        ? "tag"
        : regex.url.test(data)
          ? "url"
          : "text"
    return { type, value: data }
  })
