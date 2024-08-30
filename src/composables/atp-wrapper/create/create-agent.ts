import { AtpAgent } from "@atproto/api"
import CONSTS from "@/consts/consts.json"

export default function (this: TIAtpWrapper, service: string, pdsUrl?: string): boolean {
  this.agent = new AtpAgent({
    service: pdsUrl ?? service,
    persistSession: (event, session) => {
      console.log("[klearsky/persistSession]", `event === ${event}`)
      if (session == null) {
        console.warn("[klearsky/persistSession]", "session == null")
        return
      }

      // JWT強制削除 - ログインバージョンを設定
      ;(session as TTSession).__loggedinVersion = CONSTS.LOGGEDIN_VERSION

      this.resetSession(session, service)
    },
    fetch: fetchWithTimeout,
  })
  return this.agent != null
}

async function fetchWithTimeout (
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<Response> {
  if (
    init == null ||
    AbortController == null
  ) {
    return await globalThis.fetch(input)
  }

  // URLの取得
  const url: undefined | string = typeof input === "string"
    ? input
    : (input as URL).href != null
      ? (input as URL).href
      : undefined
  if (url == null) {
    return await globalThis.fetch(input, init)
  }

  const controller = new AbortController()
  const signal = controller.signal
  const fetchPromise = globalThis.fetch(input, { ...init, signal })
  const timeoutPromise = new Promise<never>((_, reject) => {
    // タイムアウトの取得
    let timeout = CONSTS.TIMEOUT_DEFAULT
    CONSTS.TIMEOUT_DETAILS.some((detail) => {
      if (url.endsWith(detail.url)) {
        timeout = detail.timeout
        return true
      }
      return false
    })

    const timer = setTimeout(() => {
      controller.abort()
      reject(new Error("Request timed out"))
    }, timeout)
    signal.addEventListener("abort", () => clearTimeout(timer))
  })
  return Promise.race([fetchPromise, timeoutPromise])
}
