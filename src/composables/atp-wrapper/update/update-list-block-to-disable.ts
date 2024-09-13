export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | undefined =
    await this.agent.unblockModList(listUri)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/unblockModList]", response)
  if (response instanceof Error) {
    return response
  }
}
