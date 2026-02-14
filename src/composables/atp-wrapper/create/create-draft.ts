import type { AppBskyDraftDefs } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  draft: AppBskyDraftDefs.Draft
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | { data: { id: string } } =
    await this.agent.app.bsky.draft.createDraft({ draft })
      .then((value) => value)
      .catch((error) => error)
  $log("createDraft", response)
  if (response instanceof Error) {
    return response
  }
  return response.data.id
}
