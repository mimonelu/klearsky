import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  params: {
    path: string
    did: string
    query: Record<string, any>
    server?: string
    method?: "blob" | "json"
    bearer?: boolean
  }
): Promise<Error | Response | any | Blob> {
  const searchParams = new URLSearchParams(params.query)
  let host = params.server ?? "https://bsky.social"

  // `params.server` が指定されていない場合は所属PDSを取得
  if (params.server == null) {
    const logJson = await this.fetchLogAudit(params.did)
    if (!(logJson instanceof Error) && logJson != null) {
      host = (
        Array.isArray(logJson)
          // did:plc:
          ? logJson[0]?.operation?.services?.atproto_pds?.endpoint

          // did:plc: 以外
          : logJson?.didDocument?.service?.[0]?.serviceEndpoint
      ) ?? host
    }
  }
  const url = `${host}/xrpc/${params.path}?${searchParams}`

  // Bearer の付与
  const headers = (
    params.bearer === true &&
    this.data.sessions[this.data.did]?.accessJwt != null
  )
    ? {
      headers: {
        Authorization: `Bearer ${this.data.sessions[this.data.did].accessJwt}`,
      },
    }
    : undefined

  const response: Error | Response =
    await Util.fetchWithTimeout(url, headers)
      .then((value) => value)
      .catch((error) => error)
  const logHeader = `[klearsky/${host}/xrpc/${params.path}]`
  if (response instanceof Error) {
    $log("fetchWithoutAgent", logHeader, response)
    return response
  }
  if (!response.ok) {
    $log("fetchWithoutAgent", logHeader, response)
    return Error("errorDirectAccessFailed")
  }

  // JSON に変換する場合
  if (params.method === "json") {
    const json = await response.json()
      .then((value) => value)
      .catch((error) => error)
    if (json instanceof Error) {
      $log("fetchWithoutAgent", logHeader, response)
      return json
    }
    $log("fetchWithoutAgent", logHeader, json)
    return json

  // Blob に変換する場合
  } else if (params.method === "blob") {
    const blob = await response.blob()
      .then((value) => value)
      .catch((error) => error)
    if (blob instanceof Error) {
      $log("fetchWithoutAgent", logHeader, response)
      return blob
    }
    $log("fetchWithoutAgent", logHeader, blob)
    return blob
  }

  // 変換しない場合
  $log("fetchWithoutAgent", logHeader, response)
  return response
}
