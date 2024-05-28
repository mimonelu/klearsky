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
  currentPreferences?: Array<TTPreference>
  inviteCodes?: Array<TTInviteCode>
  myFeedsItems?: Array<TTMyFeedsItem>
  myLabeler?: Array<TILabeler>
  myList?: Array<TTList>
  userProfile?: TTProfile
}

interface TIPostMessageData {
  name: "echo"
    | "getSessionCachesRequest"
    | "getSessionCachesResponse"
    | "setSessionCacheRequest"
    | "setSessionCacheResponse"
  did?: string
  key?: keyof TIMyWorkerSessionCache
  value?: any
}
