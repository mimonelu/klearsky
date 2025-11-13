export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string,
  via?: TTCidUri // like-via-repost
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | TTCidUri =
    await this.agent.like(uri, cid, via)
      .then((value) => value)
      .catch((error) => error)
  $log("like", response)
  if (response instanceof Error) {
    return response
  }
  return response.uri
}
