interface TTPostMessageData {
  name: "refreshSession"
    | "getSessionCachesRequest"
    | "getSessionCachesResponse"
    | "setSessionCacheRequest"
    | "setSessionCacheResponse"
  did?: string
  key?: string
  value?: any
}
