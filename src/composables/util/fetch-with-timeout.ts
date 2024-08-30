import CONSTS from "@/consts/consts.json"

export default async function (
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<Response> {
  if (AbortSignal == null) {
    return await globalThis.fetch(input)
  }

  // URLの取得
  const url: undefined | string = typeof input === "string"
    ? input
    : (input as URL).href != null
      ? (input as URL).href
      : (input as globalThis.Request).url

  // タイムアウトの取得
  let timeout = CONSTS.TIMEOUT_DEFAULT
  CONSTS.TIMEOUT_DETAILS.some((detail) => {
    if (url.includes(detail.url)) {
      timeout = detail.timeout
      return true
    }
    return false
  })

  return await globalThis.fetch(input, {
    ...init,
    signal: AbortSignal.timeout(timeout),
  })
}
