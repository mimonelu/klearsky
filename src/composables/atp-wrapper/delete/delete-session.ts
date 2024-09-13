import type { ComAtprotoServerDeleteSession } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  // TODO: API は成功するが、セッションが削除されない。要調査
  const response: Error | ComAtprotoServerDeleteSession.Response =
    await this.agent.api.com.atproto.server.deleteSession(undefined, {
      headers: {
        authorization: `Bearer ${this.session.refreshJwt}`,
      },
    })
      .then((value) => value)
      .catch((error) => error)

  console.log("[klearsky/deleteSession]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
