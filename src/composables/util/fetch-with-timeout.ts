import CONSTS from "@/consts/consts.json"

export default async function (
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<Response> {
  if (AbortSignal == null) {
    return await globalThis.fetch(input, init)
  }

  // URLの取得
  let urlString: string
  if (typeof input === "string") {
    urlString = input
  } else if (input instanceof URL) {
    urlString = input.href
  } else if (input instanceof Request) {
    urlString = input.url
  } else {
    urlString = String(input)
  }

  // タイムアウトの取得
  let timeout = CONSTS.TIMEOUT_DEFAULT
  for (const detail of CONSTS.TIMEOUT_DETAILS) {
    if (urlString.includes(detail.url)) {
      timeout = detail.timeout
      break
    }
  }

  return await globalThis.fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(timeout),
  })
}
