import type { BskyAgent, ComAtprotoModerationCreateReport } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  reasonType: string,
  reason: string,
  did?: string,
  cid?: string,
  uri?: string,
  type?: string
): Promise<boolean> {
  if (this.agent == null) return false
  const query: ComAtprotoModerationCreateReport.InputSchema = {
    reasonType,
    reason,
    subject: {
      $type: cid == null || uri == null
        ? "com.atproto.admin.defs#repoRef"
        : "com.atproto.repo.strongRef",
      did,
      cid,
      uri,
      type,
    },
  }
  const response: ComAtprotoModerationCreateReport.Response =
    await (this.agent as BskyAgent).com.atproto.moderation.createReport(query)
      .then((value: ComAtprotoModerationCreateReport.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/createReport]", response)
  return response.success
}
