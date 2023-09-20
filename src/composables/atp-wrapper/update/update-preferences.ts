import type { AppBskyActorPutPreferences, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  preferences: Array<TTPreference>,
): Promise<boolean> {
  if (this.agent == null) return false
  const query: AppBskyActorPutPreferences.InputSchema = { preferences }
  const response: AppBskyActorPutPreferences.Response =
    await (this.agent as BskyAgent).app.bsky.actor.putPreferences(query)
      .then((value: AppBskyActorPutPreferences.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/putPreferences]", response)
  return !!response.success
}
