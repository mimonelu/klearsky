import type { AtpAgent, ComAtprotoRepoDescribeRepo } from "@atproto/api"

// NOTICE: 異なる PDS のリポジトリに対して実行するとエラーとなる
export default async function (
  this: TIAtpWrapper,
  repo: string
): Promise<Error | {}> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoDescribeRepo.QueryParams = {
    repo,
  }
  const response: Error | ComAtprotoRepoDescribeRepo.Response =
    await (this.agent as AtpAgent).com.atproto.repo.describeRepo(query)
      .then((value: ComAtprotoRepoDescribeRepo.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/describeRepo]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
