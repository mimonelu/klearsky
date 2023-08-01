import type { BskyAgent, ComAtprotoSyncListBlobs } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  oldMedias: Array<string>,
  did: string,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) return Error("No agent")
  const query: ComAtprotoSyncListBlobs.QueryParams = { did }
  if (cursor != null) query.latest = cursor
  const response: Error | ComAtprotoSyncListBlobs.Response =
    await (this.agent as BskyAgent).com.atproto.sync.listBlobs(query)
      .then((value: ComAtprotoSyncListBlobs.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/listBlobs]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("Failed")
  response.data.cids.reverse()

  // TODO:
  oldMedias.push(...response.data.cids)

  return response.data.cids[0]
}
