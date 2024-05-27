const sessionCaches: TTMyWorkerSessionCaches = {}

;(self as any).onconnect = (event: MessageEvent) => {
  const port = event.ports[0]
  if (port == null) {
    return
  }
  port.onmessage = (event: MessageEvent) => {
    const data: TTPostMessageData = event.data
    const key = data.key
    const did = data.did
    switch (data.name) {
      // 全セッションキャッシュの取得
      case "getSessionCachesRequest": {
        if (did == null) {
          break
        }
        port.postMessage({
          name: "getSessionCachesResponse",
          value: sessionCaches[did] ?? {},
        } as TTPostMessageData)
        break
      }

      // セッションキャッシュの設定
      case "setSessionCacheRequest": {
        if (did == null || key == null) {
          break
        }
        if (sessionCaches[did] == null) {
          sessionCaches[did] = {}
        }
        sessionCaches[did][key] = data.value
        break
      }

      default: break
    }
  }
}
