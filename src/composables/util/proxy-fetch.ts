import CONSTS from "@/consts/consts.json"

// fetch をタイムアウト可能にする
// TODO: 公式がタイムアウトに対応したら外すこと
export default function () {
  if ((window.fetch as any)["__TEST__"] ||
    window.AbortController == null ||
    window.Proxy == null
  ) {
    return
  }
  window.fetch = new Proxy(window.fetch, {
    get (_, prop: string) {
      return prop === "__TEST__"
    },
    apply (target, _, argumentsList: [RequestInfo, RequestInit?]) {
      const [url = "", options = {}] = argumentsList

      // タイムアウトを取得
      let timeout = CONSTS.TIMEOUT_DEFAULT
      CONSTS.TIMEOUT_DETAILS.some((detail) => {
        if ((url as string).endsWith(detail.url)) {
          timeout = detail.timeout
          return true
        }
        return false
      })

      const controller = new AbortController()
      const signal = controller.signal
      options.signal = signal
      const setTimeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          const error = new Error("Request timed out")
          controller.abort(error)
          reject(error)
        }, timeout)
      })
      return Promise.race([
        target(url, options),
        setTimeoutPromise,
      ])
    }
  })
}
