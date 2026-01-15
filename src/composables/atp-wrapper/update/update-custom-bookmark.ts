import OWN_DOMAIN from "@/consts/own-domain.json"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid?: string,
  tags?: Array<string>
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const value: TICustomBookmark = {
    createdAt: new Date().toISOString(),
    uri,
    cid,
    tags,
  }
  const response = await this.updateRecord(
    this.session.did,
    OWN_DOMAIN.OWN_DOMAIN_BOOKMARK,
    uri,
    value,
  )
  if (response instanceof Error) {
    return response
  }
  return response
}
