import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  pathToXrpc: string,
  did: string,
  query: Record<string, any>,
  server?: string
): Promise<Error | Response> {
  const params = new URLSearchParams(query)
  let host = server ?? "https://bsky.social"
  if (server == null) {
    const logJson = await this.fetchLogAudit(did)
    if (logJson != null) {
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
      .then((value: any) => value)
      .catch((error: any) => error)
  console.log(`[klearsky/${host}/xrpc/${pathToXrpc}]`, response)
  if (response instanceof Error) {
    return response
  }
  if (!response.ok) {
    return Error("errorDirectAccessFailed")
  }
  return response
}
