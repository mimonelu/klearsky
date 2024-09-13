export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | TTCidUri =
    await this.agent.like(uri, cid)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/like]", response)
  if (response instanceof Error) {
    return response
  }
  return response.uri
}
