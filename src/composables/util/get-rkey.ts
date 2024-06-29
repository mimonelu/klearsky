import { AtUri } from "@atproto/api"

export default function (text?: string): string {
  if (text == null) {
    return ""
  }
  const { rkey } = new AtUri(text)
  return rkey
}
