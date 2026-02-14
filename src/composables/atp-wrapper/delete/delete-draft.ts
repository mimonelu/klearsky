export default async function (
  this: TIAtpWrapper,
  id: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | undefined =
    await this.agent.app.bsky.draft.deleteDraft({ id })
      .then(() => undefined)
      .catch((error: Error) => error)
  $log("deleteDraft", response)
  if (response instanceof Error) {
    return response
  }
}
