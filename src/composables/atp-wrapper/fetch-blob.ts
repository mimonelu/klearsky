import type { ComAtprotoSyncGetBlob, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  cid: string,
  did?: string
): Promise<null | Uint8Array> {
  if (this.agent == null) return null
  if (this.session == null) return null
  const query: ComAtprotoSyncGetBlob.QueryParams = {
    did: did ?? (this.session.did as string),
    cid,
  }
  const response: null | ComAtprotoSyncGetBlob.Response = await (
    this.agent as BskyAgent
  ).api.com.atproto.sync.getBlob(query)
    .catch((error: any) => console.error("[klearsky/getBlob]", error))
    .then((value: any) => value)
  console.log("[klearsky/getBlob]", response)
  if (!response?.success) return null
  return response.data
}
