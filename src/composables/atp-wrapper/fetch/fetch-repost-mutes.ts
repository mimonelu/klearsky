import OWN_DOMAIN from "@/consts/own-domain"

export default async function (
  this: TIAtpWrapper
): Promise<Error | Array<TIRepostMuteSubject>> {
  if (this.session == null) {
    return Error("noSessionError")
  }
  const uri = `at://${this.session.did}/${OWN_DOMAIN.OWN_DOMAIN_REPOST_MUTES}/self`
  const response = await this.fetchRecord(
    this.session.did,
    OWN_DOMAIN.OWN_DOMAIN_REPOST_MUTES,
    uri
  )
  if (response instanceof Error) {
    // レコードが存在しない場合は空配列を返す
    return []
  }
  return (response.value as TIRepostMutesRecord).subjects ?? []
}
