import type {
  BskyAgent,
  ComAtprotoServerGetAccountInviteCodes,
} from "@atproto/api"

export default async function (
  this: TIAtpWrapper
): Promise<null | TTInviteCode[]> {
  if (this.agent == null) return null
  const query: ComAtprotoServerGetAccountInviteCodes.QueryParams = {
    includeUsed: true,
    createAvailable: true, // TODO: 用途不明。要調査
  }
  const response: ComAtprotoServerGetAccountInviteCodes.Response = await (
    this.agent as BskyAgent
  ).com.atproto.server.getAccountInviteCodes(query)
  console.log("[klearsky/getAccountInviteCodes]", response)
  if (!response.success) return null
  return response.data.codes
}
