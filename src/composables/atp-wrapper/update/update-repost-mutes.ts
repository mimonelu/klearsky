import OWN_DOMAIN from "@/consts/own-domain"

export default async function (
  this: TIAtpWrapper,
  subjects: Array<TIRepostMuteSubject>
): Promise<Error | TTCidUri> {
  if (this.session == null) {
    return Error("noSessionError")
  }
  const value: TIRepostMutesRecord = {
    $type: OWN_DOMAIN.OWN_DOMAIN_REPOST_MUTES,
    subjects,
    createdAt: new Date().toISOString(),
  }
  const response = await this.updateRecord(
    this.session.did,
    OWN_DOMAIN.OWN_DOMAIN_REPOST_MUTES,
    `at://${this.session.did}/${OWN_DOMAIN.OWN_DOMAIN_REPOST_MUTES}/self`,
    value,
  )
  if (response instanceof Error) {
    return response
  }
  return response
}
