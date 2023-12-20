import type { BlobRef, BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  name?: string,
  description?: string,
  avatarBlobRef?: BlobRef
): Promise<string | Error> {
  if (this.agent == null) return Error("No Agent")
  const createdAt = new Date().toISOString()
  const query: ComAtprotoRepoCreateRecord.InputSchema = {
    repo: this.session?.did as string,
    collection: "app.bsky.graph.list",
    record: {
      $type: "app.bsky.graph.list",
      createdAt,
      description,
      name,
      purpose: "app.bsky.graph.defs#curatelist",
    },
  }
  if (avatarBlobRef != null) (query.record as any).avatar = avatarBlobRef
  const response: ComAtprotoRepoCreateRecord.Response =
    await (this.agent as BskyAgent).com.atproto.repo.createRecord(query)
      .then((value: ComAtprotoRepoCreateRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/createRecord]", response)
  if (!response.success) return Error("Failed")
  return response.data.uri
}
