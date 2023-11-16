import type { BskyAgent, ComAtprotoSyncGetBlob } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  cid: string,
  did?: string
): Promise<null | Uint8Array> {
  // PDS移管に伴うアニメーション画像再生の不具合対応
  // TODO: PDS分割に伴う暫定処置
  if (this.session == null) return null
  did = did ?? (this.session.did as string)
  const query: Record<string, string> = {
    did,
    cid,
  }
  const params = new URLSearchParams(query)

  // Sandbox PDS 対応
  let host = "https://bsky.social"
  if (this.session?.__sandbox) {
    const logJson = await this.fetchLogAudit(did)
    if (logJson != null) host = logJson[0]?.operation?.services?.atproto_pds?.endpoint ?? host
  }

  const url = `${host}/xrpc/com.atproto.sync.getBlob?${params}`
  const response: Response = await fetch(url)
    .catch((error: any) => console.error("[klearsky/getBlob]", error))
    .then((value: any) => value)
  if (!response.ok) return null
  return await response.blob() as unknown as Uint8Array

  /*
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: ComAtprotoSyncGetBlob.QueryParams = {
    did: did ?? (this.session.did as string),
    cid,
  }
  const response: null | ComAtprotoSyncGetBlob.Response =
    await (this.agent as BskyAgent).api.com.atproto.sync.getBlob(query)
      .catch((error: any) => console.error("[klearsky/getBlob]", error))
      .then((value: any) => value)
  console.log("[klearsky/getBlob]", response)
  if (!response?.success) return null
  return response.data
  */
}
