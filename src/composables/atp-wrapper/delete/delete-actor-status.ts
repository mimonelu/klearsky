import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(`at://${did}/app.bsky.actor.status/self`)
  const response: Error | undefined =
    await this.agent.app.bsky.actor.status.delete({
      repo: did,
      rkey,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/deleteActorStatus]", response)
  if (response instanceof Error) {
    return response
  }
}
