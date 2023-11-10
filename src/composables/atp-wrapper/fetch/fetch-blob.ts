import type { BskyAgent, ComAtprotoSyncGetBlob } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  cid: string,
  did?: string
): Promise<null | Uint8Array> {
  // PDS移管に伴うアニメーション画像再生の不具合対応
  // TODO: 暫定処置。同一PDSであれば getBlob を使用するように換装すること
  const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`
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
