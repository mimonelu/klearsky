import type { ComAtprotoModerationCreateReport } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  reasonType: string,
  reason: string,
  did?: string,
  cid?: string,
  uri?: string,
  type?: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
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
  const response: Error | ComAtprotoModerationCreateReport.Response =
    await this.agent.com.atproto.moderation.createReport(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createReport]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
