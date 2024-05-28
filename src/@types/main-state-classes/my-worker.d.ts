interface TIMyWorker {
  mainState: MainState
  worker?: SharedWorker
  setSessionCache: (key: string, value: any) => void
}

interface TIMyWorkerSessionCaches {
  [did: string]: TIMyWorkerSessionCache
}

interface TIMyWorkerSessionCache {
  session?: TTSession
  currentPreferences?: any
  inviteCodes?: any
  myFeedsItems?: any
  myLabeler?: any
  myList?: any
  userProfile?: any
}

interface TIPostMessageData {
  name:
      "getSessionCachesRequest"
    | "getSessionCachesResponse"
    | "setSessionCacheRequest"
    | "setSessionCacheResponse"
  did?: string
  key?: keyof TIMyWorkerSessionCache
  value?: any
}
