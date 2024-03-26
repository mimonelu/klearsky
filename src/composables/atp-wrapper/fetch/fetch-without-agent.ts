export default async function (
  this: TIAtpWrapper,
  pathToXrpc: string,
  did: string,
  query: Record<string, string>
): Promise<undefined | Response> {
  const params = new URLSearchParams(query)
  let host = "https://bsky.social"
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
  const url = `${host}/xrpc/${pathToXrpc}?${params}`
  const response: Error | Response =
    await fetch(url)
      .then((value: any) => value)
      .catch((error: any) => error)
  console.log(`[klearsky/${host}/xrpc/${pathToXrpc}]`, response)
  if (response instanceof Error) return
  if (!response.ok) return
  return response
}
