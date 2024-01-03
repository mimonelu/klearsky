import { RichText } from "@atproto/api"

export default (text: string): number => {
  const richText = new RichText({ text })
  return richText.graphemeLength
}
