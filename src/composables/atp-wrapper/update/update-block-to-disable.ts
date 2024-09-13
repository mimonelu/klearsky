import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const rkey = Util.getRkey(uri)
  const query = {
    repo: this.session?.did as string,
    rkey,
  }
  const response: Error | undefined =
    await this.agent.app.bsky.graph.block.delete(query)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    return response
  }
}
