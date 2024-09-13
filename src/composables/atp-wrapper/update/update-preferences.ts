import type { AppBskyActorPutPreferences } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  preferences: Array<TTPreference>,
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyActorPutPreferences.InputSchema = { preferences }
  const response: Error | AppBskyActorPutPreferences.Response =
    await this.agent.app.bsky.actor.putPreferences(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/putPreferences]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
