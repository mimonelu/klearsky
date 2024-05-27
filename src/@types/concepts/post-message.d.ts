interface TTPostMessageData {
  name: "refreshSession"
    | "getSessionCachesRequest"
    | "getSessionCachesResponse"
    | "setSessionCacheRequest"
    | "setSessionCacheResponse"
  did?: string
  key?: keyof TTMyWorkerSessionCache
  value?: any
}
