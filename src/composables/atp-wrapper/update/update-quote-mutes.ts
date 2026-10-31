import OWN_DOMAIN from "@/consts/own-domain"

export default async function (
  this: TIAtpWrapper,
  subjects: Array<TIQuoteMuteSubject>
): Promise<Error | TTCidUri> {
  if (this.session == null) {
    return Error("noSessionError")
  }
  const value: TIQuoteMutesRecord = {
    $type: OWN_DOMAIN.OWN_DOMAIN_QUOTE_MUTES,
    subjects,
    createdAt: new Date().toISOString(),
  }
  const response = await this.updateRecord(
    this.session.did,
    OWN_DOMAIN.OWN_DOMAIN_QUOTE_MUTES,
    `at://${this.session.did}/${OWN_DOMAIN.OWN_DOMAIN_QUOTE_MUTES}/self`,
    value,
  )
  if (response instanceof Error) {
    return response
  }
  return response
}
