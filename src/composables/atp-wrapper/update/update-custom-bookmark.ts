import { THIRD_PARTY_DOMAIN_BOOKMARK } from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid?: string
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const response = await this.updateRecord(
    this.session.did,
    THIRD_PARTY_DOMAIN_BOOKMARK,
    uri,
    {
      createdAt: new Date().toISOString(),
      uri,
      cid,
    },
  )
  if (response instanceof Error) {
    return response
  }
  return response
}
