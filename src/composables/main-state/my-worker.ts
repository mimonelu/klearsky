import MyWorker from "@/worker/my-worker.ts?sharedworker"

export default class {
  public mainState: MainState
  public worker?: SharedWorker

  constructor (mainState: MainState) {
    this.mainState = mainState
    if (window.SharedWorker == null) return
    this.worker = new MyWorker()
    this.worker.port.start()
    this.worker.port.onmessage = (event: MessageEvent) => {
      const data: TTPostMessageData = event.data
      console.log("[klearsky/onmessage]", data)
      switch (data.name) {
        // 全セッションキャッシュの反映
        case "getSessionCachesResponse": {
          const sessionCache: TTMyWorkerSessionCache = data.value

          // 全セッションキャッシュの反映 - プリファレンス
          if (sessionCache.currentPreferences != null) {
            mainState.currentPreferences = sessionCache.currentPreferences
          }

          // 全セッションキャッシュの反映 - ユーザープロフィール
          if (sessionCache.userProfile != null) {
            mainState.userProfile = sessionCache.userProfile
          }

          // 全セッションキャッシュの反映 - マイフィード
          if (sessionCache.myFeedsItems != null) {
            mainState.myFeeds.items.splice(0, mainState.myFeeds.items.length, ...sessionCache.myFeedsItems)
          }

          // 全セッションキャッシュの反映 - マイリスト
          if (sessionCache.myList != null) {
            mainState.myList = sessionCache.myList
          }

          // 全セッションキャッシュの反映 - 招待コード
          if (sessionCache.inviteCodes != null) {
            mainState.inviteCodes = sessionCache.inviteCodes
          }

          break
        }

        default: break
      }
    }
    this.worker.port.postMessage({
      name: "getSessionCachesRequest",
      did: this.mainState.atp.data.did,
    } as TTPostMessageData)
  }

  setSessionCache (key: string, json: any) {
    const value = JSON.parse(JSON.stringify(json))

    // Worker にキャッシュ
    this.worker?.port.postMessage({
      name: "setSessionCacheRequest",
      did: this.mainState.atp.data.did,
      key,
      value,
    } as TTPostMessageData)

    // 変更をブロードキャスト
    this.mainState.broadcastChannel?.postMessage({
      name: "setSessionCacheResponse",
      did: this.mainState.atp.data.did,
      key,
      value,
    } as TTPostMessageData)
  }
}
