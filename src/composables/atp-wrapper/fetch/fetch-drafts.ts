import type { AppBskyDraftDefs } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  limit?: number,
  cursor?: string
): Promise<Error | { cursor?: string; drafts: AppBskyDraftDefs.DraftView[] }> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response =
    await this.agent.app.bsky.draft.getDrafts({ limit, cursor })
      .then((value) => value)
      .catch((error) => error)
  $log("fetchDrafts", response)
  if (response instanceof Error) {
    return response
  }
  return response.data
}
