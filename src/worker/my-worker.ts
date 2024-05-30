const ports: Array<MessagePort> = []

const sessionCaches: TIMyWorkerSessionCaches = {}

const notificationTimerNows: { [did: string]: number } = {}

function main () {
  ;(self as any).onconnect = (event: MessageEvent) => {
    onConnect(event)
  }
  // startPeriodicProcess()
}

function onConnect (event: MessageEvent) {
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

function onMessage (event: MessageEvent, currentPort: MessagePort) {
  const data: TIPostMessageData = event.data
  const key = data.key
  const did = data.did
  switch (data.name) {
    case "close": {
      if (removePort(currentPort)) {
        postMessageAll({
          name: "echo",
          did,
          value: "CLOSED",
        }, undefined)
      }
      break
    }

    // セッションキャッシュの取得
    case "getSessionCachesRequest": {
      if (did == null) {
        break
      }
      try {
        currentPort.postMessage({
          name: "getSessionCachesResponse",
          did,
          value: sessionCaches[did],
        })
      } catch (error) {
        removePort(currentPort)
      }
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
      postMessageAll({
        name: "getSessionCachesResponse",
        did,
        value: sessionCaches[did],
      }, currentPort)
      break
    }

    default: break
  }
}

/*
function startPeriodicProcess () {
  setInterval(() => {
    const now = Date.now()
    for (const did in sessionCaches) {
      const sessionCache = sessionCaches[did]
      const interval = sessionCache.setting?.notificationFetchInterval
      if (interval == null) {
        continue
      }
      if (notificationTimerNows[did] == null) {
        notificationTimerNows[did] = now
      }
      const delta = now - notificationTimerNows[did]
      if (delta < interval) {
        continue
      }
      notificationTimerNows[did] = now
      try {
        ports[0]?.postMessage({
          name: "notificationFetchOrder",
          did,
        })
      } catch (error) {
        ports.splice(0, 1)
      }
    }
  }, 1000)
}
*/

function removePort (port: MessagePort): boolean {
  const index = ports.indexOf(port)
  if (index !== - 1) {
    ports.splice(index, 1)
    return true
  }
  return false
}

function postMessageAll (data: TIPostMessageData, currentPort?: MessagePort) {
  for (let i = ports.length - 1; i >= 0; i --) {
    // このポートには送信しない
    if (ports[i] !== currentPort) {
      try {
        ports[i].postMessage(data)
      } catch (error) {
        ports.splice(i, 1)
      }
    }
  }
}

main()
