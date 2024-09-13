import type { ComAtprotoServerGetServiceAuth } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  aud: string,
  lxm?: string,
  exp?: number
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoServerGetServiceAuth.Response =
    await this.agent.com.atproto.server.getServiceAuth({
      aud,
      lxm,
      exp,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getServiceAuth]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.token
}
