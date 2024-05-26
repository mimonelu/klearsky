interface TTMyWorker {
  mainState: MainState
  worker?: SharedWorker
  setSessionCache: (key: string, value: any) => void
}

interface TTMyWorkerSessionCaches {
  [did: string]: TTMyWorkerSessionCache
}

interface TTMyWorkerSessionCache {
  [k: string]: any
}
