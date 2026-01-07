import { AtUri } from "@atproto/api"

export default function (text?: string): string {
  if (!text) {
    return ""
  }
  const { rkey } = new AtUri(text)
  return rkey
}
