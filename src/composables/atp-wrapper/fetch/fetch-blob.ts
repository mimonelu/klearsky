export default async function (
  this: TIAtpWrapper,
  cid: string,
  did?: string
): Promise<null | Blob> {
  // PDS移管に伴うアニメーション画像再生の不具合対応
  // TODO: PDS分割に伴う暫定処置
  if (this.session == null) return null
  did = did ?? (this.session.did as string)
  const query: Record<string, string> = {
    did,
    cid,
  }

  const response = await this.fetchWithoutAgent(
    "com.atproto.sync.getBlob",
    did,
    query
  )
  if (response instanceof Error) return null
  return await response.blob()
}
