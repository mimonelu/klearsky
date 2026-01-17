import { AtUri } from "@atproto/api"

export default function (text?: string): string {
  if (!text) {
    return ""
  }
  try {
    const { rkey } = new AtUri(text)
    return rkey
  } catch (error) {
    $error("new AtUri", error)
    return ""
  }
}
