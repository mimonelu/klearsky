import type { AppBskyActorGetPreferences, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>> {
  if (this.agent == null) return
  const response: AppBskyActorGetPreferences.Response =
    await (this.agent as BskyAgent).app.bsky.actor.getPreferences()
      .then((value: AppBskyActorGetPreferences.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPreferences]", response)
  if (!response.success) return
  return response.data.preferences as Array<TTPreference>
}
