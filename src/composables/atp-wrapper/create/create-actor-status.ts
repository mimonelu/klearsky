import type { AppBskyActorStatus, Un$Typed } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  type: string,
  durationMinutes?: number,
  embed?: {
    uri: string
    title: string
    description: string
  }
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const record: Un$Typed<AppBskyActorStatus.Record> = {
    status: `app.bsky.actor.status#${type}`,
    createdAt: new Date().toISOString(),
    durationMinutes,
  }
  if (embed != null) {
    record.embed = {
      $type: "app.bsky.embed.external",
      external: {
        $type: "app.bsky.embed.external#external",
        uri: embed.uri,
        title: embed.title,
        description: embed.description,
        // thumb: null,
      },
    }
  }
  const response: Error | TTCidUri =
    await this.agent.app.bsky.actor.status.create({
      repo: this.session?.did as string,
    }, record)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createActorStatus]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}
