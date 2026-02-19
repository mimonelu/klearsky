import type { AppBskyDraftDefs, AppBskyDraftUpdateDraft } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  id: string,
  draft: AppBskyDraftDefs.Draft
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyDraftUpdateDraft.Response =
    await this.agent.app.bsky.draft.updateDraft({
      draft: { id, draft },
    })
      .then((value) => value)
      .catch((error) => error)
  $log("updateDraft", response)
  if (response instanceof Error) {
    return response
  }
}
