import type { ComAtprotoServerDescribeServer } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | TTServerInfo> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoServerDescribeServer.Response =
    await this.agent.com.atproto.server.describeServer()
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/describeServer]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
