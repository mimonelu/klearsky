import type { AtpAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string,
  userDid: string
): Promise<string | Error> {
  if (this.agent == null) return Error("noAgentError")
  if (this.session == null) return Error("noSessionError")
  const createdAt = new Date().toISOString()
  const query: ComAtprotoRepoCreateRecord.InputSchema = {
    repo: this.session.did,
    collection: "app.bsky.graph.listitem",
    record: {
      $type: "app.bsky.graph.listitem",
      createdAt,
      list: listUri,
      subject: userDid,
    },
  }
  const response: Error | ComAtprotoRepoCreateRecord.Response =
    await (this.agent as AtpAgent).com.atproto.repo.createRecord(query)
      .then((value: ComAtprotoRepoCreateRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/createRecord]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.uri
}
