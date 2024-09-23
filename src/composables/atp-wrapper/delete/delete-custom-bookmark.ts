import { THIRD_PARTY_DOMAIN_BOOKMARK } from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const response = await this.deleteRecord(
    this.session.did,
    THIRD_PARTY_DOMAIN_BOOKMARK,
    uri
  )
  if (response instanceof Error) {
    return response
  }
}
