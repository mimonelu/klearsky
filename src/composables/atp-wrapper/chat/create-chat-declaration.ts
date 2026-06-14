export default async function (
  this: TIAtpWrapper,
  repo: string,
  allowIncoming: TTAllowIncoming,
  allowGroupInvites: TTAllowGroupInvites
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers: Record<string, string> = {}
  const response: Error | TTCidUri =
    await this.agent.chat.bsky.actor.declaration.create(
      { repo },
      {
        allowIncoming,
        allowGroupInvites,
      },
      headers
    )
      .then((value) => value)
      .catch((error) => error)
  $log("chat.bsky.actor.declaration.create", response)
  if (response instanceof Error) {
    return response
  }
  return response
}
