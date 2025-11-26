import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | TIActorStatusRecord> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(`at://${did}/app.bsky.actor.status/self`)
  const response: Error | (TTCidUri & { value: TIActorStatusRecord }) =
    await this.agent.app.bsky.actor.status.get({
      repo: did,
      rkey,
    })
      .then((value) => value)
      .catch((error) => error)
  $log("fetchActorStatus", response)
  if (response instanceof Error) {
    return response
  }

  // 公開終了日時のインジェクション
  const expiredAt = new Date(response.value.createdAt)
  expiredAt.setMinutes(expiredAt.getMinutes() + (response.value.durationMinutes ?? 0))
  response.value.__expiredAt = expiredAt.toISOString()

  return response.value
}
