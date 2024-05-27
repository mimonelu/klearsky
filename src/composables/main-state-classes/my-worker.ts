import MyWorker from "@/worker/my-worker.ts?sharedworker"
import Util from "@/composables/util"

export default class {
  public mainState: MainState

  public worker?: SharedWorker

  constructor (mainState: MainState) {
    this.mainState = mainState
    if (window.SharedWorker == null) {
      return
    }
    this.worker = new MyWorker()
    this.worker.port.start()
    this.worker.port.onmessage = this.listenOnMessage
    this.worker.port.postMessage({
      name: "getSessionCachesRequest",
      did: this.mainState.atp.data.did,
    } as TTPostMessageData)
  }

  listenOnMessage (event: MessageEvent) {
    const data: TTPostMessageData = event.data
    console.log("[klearsky/listenOnMessage]", data)
    switch (data.name) {
      // 全セッションキャッシュの反映
      case "getSessionCachesResponse": {
        const sessionCache: TTMyWorkerSessionCache = data.value

        // 全セッションキャッシュの反映 - プリファレンス
        if (sessionCache.currentPreferences != null) {
          this.mainState.currentPreferences = sessionCache.currentPreferences
        }

        // 全セッションキャッシュの反映 - ユーザープロフィール
        if (sessionCache.userProfile != null) {
          this.mainState.userProfile = sessionCache.userProfile
        }

        // 全セッションキャッシュの反映 - マイフィード
        if (sessionCache.myFeedsItems != null) {
          this.mainState.myFeeds.items.splice(
            0,
            this.mainState.myFeeds.items.length,
            ...sessionCache.myFeedsItems
          )
        }

        // 全セッションキャッシュの反映 - マイリスト
        if (sessionCache.myList != null) {
          this.mainState.myLists.items = sessionCache.myList
        }

        // 全セッションキャッシュの反映 - 招待コード
        if (sessionCache.inviteCodes != null) {
          this.mainState.inviteCodes = sessionCache.inviteCodes
        }

        break
      }

      default: break
    }
  }

  setSessionCache (key: string, json: any) {
    const value = Util.cloneJson(json)
    if (value == null) {
      return
    }

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
