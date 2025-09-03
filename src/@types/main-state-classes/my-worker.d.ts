interface TIMyWorker {
  mainState: MainState
  worker?: SharedWorker
  close: () => void
  setSessionCache: (key: string, value: any) => void
}

interface TIMyWorkerSessionCaches {
  [did: string]: TIMyWorkerSessionCache
}

interface TIMyWorkerSessionCache {
  session?: TTSession
  setting?: TTSetting
  currentPreferences?: Array<TTPreference>
  customBookmarkPacks?: Array<TICustomBookmarkPack>
  inviteCodes?: Array<TTInviteCode>
  myFeedsItems?: Array<TTMyFeedsItem>
  myLabeler?: Array<TILabeler>
  myList?: Array<TTList>
  serverInfo?: TTServerInfo
  userProfile?: TTProfile
}

interface TIPostMessageData {
  name: "close"
    | "echo"
    | "getSessionCachesRequest"
    | "getSessionCachesResponse"
    | "setSessionCacheRequest"
    | "setSessionCacheResponse"
  did?: string
  key?: keyof TIMyWorkerSessionCache
  value?: any
}
