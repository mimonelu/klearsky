const ports: Array<MessagePort> = []

const sessionCaches: TIMyWorkerSessionCaches = {}

;(self as any).onconnect = (event: MessageEvent) => {
  const currentPort = event.ports[0]
  if (currentPort == null) {
    return
  }
  ports.push(currentPort)
  currentPort.onmessage = (event: MessageEvent) => {
    onMessage(event, currentPort)
  }
  currentPort.start()
}

function postMessageAll (currentPort: MessagePort, data: TIPostMessageData) {
  ports.forEach((port) => {
    // このポートには送信しない
    if (port !== currentPort) {
      port.postMessage(data)
    }
  })
}

function onMessage (event: MessageEvent, currentPort: MessagePort) {
  const data: TIPostMessageData = event.data
  const key = data.key
  const did = data.did
  switch (data.name) {
    // セッションキャッシュの取得
    case "getSessionCachesRequest": {
      if (did == null) {
        break
      }
      currentPort.postMessage({
        name: "getSessionCachesResponse",
        did,
        value: sessionCaches[did],
      })
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
      postMessageAll(currentPort, {
        name: "getSessionCachesResponse",
        did,
        value: sessionCaches[did],
      })
      break
    }

    default: break
  }
}
