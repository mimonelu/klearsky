import type { BskyAgent, ComAtprotoServerDescribeServer } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | TTServerInfo> {
  if (this.agent == null) return Error("noAgentError")
  const response: Error | ComAtprotoServerDescribeServer.Response =
    await (this.agent as BskyAgent).api.com.atproto.server.describeServer()
      .then((value: ComAtprotoServerDescribeServer.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/fetchServer]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data
}
