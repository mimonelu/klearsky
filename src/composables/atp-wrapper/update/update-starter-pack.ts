import type { ComAtprotoRepoPutRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  starterPack: TIStarterPack,
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(starterPack.uri)
  const query: ComAtprotoRepoPutRecord.InputSchema = {
    repo: this.session?.did as string,
    collection: "app.bsky.graph.starterpack",
    rkey,
    record: {
      $type: "app.bsky.graph.starterpack",
      createdAt: starterPack.indexedAt,
      description: starterPack.record.description,
      descriptionFacets: starterPack.record.descriptionFacets,
      feeds: starterPack.record.feeds,
      list: starterPack.record.list,
      name: starterPack.record.name,
      updatedAt: (new Date()).toISOString(),
    },
  }
  const response: Error | ComAtprotoRepoPutRecord.Response =
    await this.agent.com.atproto.repo.putRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/updateStarterPack]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
