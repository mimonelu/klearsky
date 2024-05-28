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
    this.worker.port.onmessage = this.onMessage.bind(this)
    this.worker.port.start()
    this.worker.port.postMessage({
      name: "getSessionCachesRequest",
      did: this.mainState.atp.data.did,
    })
  }

  onMessage (event: MessageEvent) {
    const data: TIPostMessageData = event.data

    // DID が合わないメッセージはスルー
    if (data.did !== this.mainState.atp.data.did) {
      console.log("[klearsky/onMessage]", "💔")
      return
    }

    console.log("[klearsky/onMessage]", "💕", data)
    switch (data.name) {
      // セッションキャッシュの取得
      case "getSessionCachesResponse": {
        const sessionCache: TIMyWorkerSessionCache = data.value

        // 全セッションキャッシュの反映 - セッションデータ
        if (sessionCache.session != null) {
          this.mainState.atp.resetSession(sessionCache.session)
        }

        // 全セッションキャッシュの反映 - プリファレンス
        if (sessionCache.currentPreferences != null) {
          Util.setArray(this.mainState.currentPreferences, sessionCache.currentPreferences)
        }

        // 全セッションキャッシュの反映 - ユーザープロフィール
        if (sessionCache.userProfile != null) {
          this.mainState.userProfile = sessionCache.userProfile
        }

        // 全セッションキャッシュの反映 - マイフィード
        if (sessionCache.myFeedsItems != null) {
          Util.setArray(this.mainState.myFeeds.items, sessionCache.myFeedsItems)
          this.mainState.myFeeds.synchronizeToMyList()
        }

        // 全セッションキャッシュの反映 - マイラベラー
        if (sessionCache.myLabeler != null) {
          Util.setArray(this.mainState.myLabeler.labelers, sessionCache.myLabeler)
          this.mainState.myLabeler.updateLabelMap()

          // ラベラーのHTTPヘッダーを設定
          this.mainState.myLabeler.setAtprotoAcceptLabelers()
        }

        // 全セッションキャッシュの反映 - マイリスト
        if (sessionCache.myList != null) {
          Util.setArray(this.mainState.myLists.items, sessionCache.myList)
          this.mainState.myFeeds.synchronizeToMyList()
        }

        // 全セッションキャッシュの反映 - 招待コード
        if (sessionCache.inviteCodes != null) {
          Util.setArray(this.mainState.inviteCodes, sessionCache.inviteCodes)
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

    // セッションキャッシュの設定
    this.worker?.port.postMessage({
      name: "setSessionCacheRequest",
      did: this.mainState.atp.data.did,
      key,
      value,
    })
  }
}
