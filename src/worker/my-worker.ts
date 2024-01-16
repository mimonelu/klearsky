const sessionCaches: TTMyWorkerSessionCaches = {}

;(self as any).onconnect = (event: MessageEvent) => {
  const port = event.ports[0]
  if (port == null) return

  port.onmessage = (event: MessageEvent) => {
    const data: TTPostMessageData = event.data
    switch (data.name) {
      // 全セッションキャッシュの取得
      case "getSessionCachesRequest": {
        if (data.did == null) {
          break
        }
        port.postMessage({
          name: "getSessionCachesResponse",
          value: sessionCaches[data.did] ?? {},
        } as TTPostMessageData)
        break
      }

      // セッションキャッシュの設定
      case "setSessionCacheRequest": {
        if (data.did == null || data.key == null) {
          break
        }
        if (sessionCaches[data.did] == null) {
          sessionCaches[data.did] = {}
        }
        sessionCaches[data.did][data.key] = data.value
        break
      }

      default: break
    }
  }
}
