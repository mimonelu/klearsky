import type { AtpAgent, ComAtprotoModerationCreateReport } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  params: TTCreateReportParams
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoModerationCreateReport.InputSchema = {
    reasonType: params.reasonType,
    reason: params.reason,
    subject: {
      $type: params.cid == null || params.uri == null
        ? "com.atproto.admin.defs#repoRef"
        : "com.atproto.repo.strongRef",
      did: params.did,
      cid: params.cid,
      uri: params.uri,

      // 型にはないが、公式アプリではリストレポート時に含めている
      type: params.type,
    } as any,
  }
  const agent: AtpAgent = params.atprotoLabeler != null
    ? this.agent.withProxy("atproto_labeler", params.atprotoLabeler)
    : this.agent
  const response: Error | ComAtprotoModerationCreateReport.Response =
    await agent.com.atproto.moderation.createReport(query)
      .then((value) => value)
      .catch((error) => error)
  $log("createReport", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
