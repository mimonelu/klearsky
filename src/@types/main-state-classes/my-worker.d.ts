interface TTMyWorker {
  mainState: MainState
  worker?: SharedWorker
  setSessionCache: (key: string, value: any) => void
}

interface TTMyWorkerSessionCaches {
  [did: string]: TTMyWorkerSessionCache
}

interface TTMyWorkerSessionCache {
  currentPreferences?: any
  inviteCodes?: any
  myFeedsItems?: any
  myList?: any
  userProfile?: any
}
