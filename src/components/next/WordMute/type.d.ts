interface TIWordMute {
  enabled: Array<boolean>
  keyword: string
  targets?: Array<"content" | "tag" | "url">
  actorTarget?: Array<"exclude-following">
  expiresAt?: string
}
