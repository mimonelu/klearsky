import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  pathToXrpc: string,
  did: string,
  query: Record<string, any>,
  server?: string,
  method?: "blob" | "json"
): Promise<Error | Response | any | Blob> {
  const params = new URLSearchParams(query)
  let host = server ?? "https://bsky.social"
  if (server == null) {
    const logJson = await this.fetchLogAudit(did)
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
  const url = `${host}/xrpc/${pathToXrpc}?${params}`
  const response: Error | Response =
    await Util.fetchWithTimeout(url)
      .then((value) => value)
      .catch((error) => error)
  const logHeader = `[klearsky/${host}/xrpc/${pathToXrpc}]`
  if (response instanceof Error) {
    console.log(logHeader, response)
    return response
  }
  if (!response.ok) {
    console.log(logHeader, response)
    return Error("errorDirectAccessFailed")
  }

  // JSON に変換する場合
  if (method === "json") {
    const json = await response.json()
      .then((value) => value)
      .catch((error) => error)
    if (json instanceof Error) {
      console.log(logHeader, response)
      return json
    }
    console.log(logHeader, json)
    return json

  // Blob に変換する場合
  } else if (method === "blob") {
    const blob = await response.blob()
      .then((value) => value)
      .catch((error) => error)
    if (blob instanceof Error) {
      console.log(logHeader, response)
      return blob
    }
    console.log(logHeader, blob)
    return blob
  }

  // 変換しない場合
  console.log(logHeader, response)
  return response
}
