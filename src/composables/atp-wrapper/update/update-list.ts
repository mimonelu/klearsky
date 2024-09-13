import type { BlobRef, ComAtprotoRepoPutRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  list: TTList,
  avatarBlobRef?: BlobRef
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(list.uri)
  const query: ComAtprotoRepoPutRecord.InputSchema = {
    repo: this.session?.did as string,
    collection: "app.bsky.graph.list",
    rkey,
    record: {
      $type: "app.bsky.graph.list",
      createdAt: list.indexedAt,
      description: list.description,
      name: list.name,
      purpose: list.purpose,
    },
  }
  if (avatarBlobRef != null) {
    (query.record as any).avatar = avatarBlobRef
  }
  const response: Error | ComAtprotoRepoPutRecord.Response =
    await this.agent.com.atproto.repo.putRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/updateList]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
