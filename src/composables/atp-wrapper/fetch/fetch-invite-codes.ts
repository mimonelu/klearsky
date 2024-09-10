import type { AtpAgent, ComAtprotoServerGetAccountInviteCodes } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | TTInviteCode[]> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoServerGetAccountInviteCodes.QueryParams = {
    includeUsed: true,
    createAvailable: true,
  }
  const response: Error | ComAtprotoServerGetAccountInviteCodes.Response =
    await (this.agent as AtpAgent).com.atproto.server.getAccountInviteCodes(query)
      .then((value: ComAtprotoServerGetAccountInviteCodes.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getAccountInviteCodes]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.codes
}
