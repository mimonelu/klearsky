import type { ComAtprotoServerDeleteSession } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  // OAuth認証の場合
  if (this.session.__authType === "oauth") {
    if (this.oauthClient == null) {
      return Error("noOAuthClientError")
    }
    const response: Error | void =
      await this.oauthClient.revoke(this.session.did)
        .then(() => undefined)
        .catch((error) => error)
    $log("deleteSession (OAuth)", response)
    if (response instanceof Error) {
      return response
    }
    return
  }

  // 通常認証の場合
  // TODO: API は成功するが、セッションが削除されない。要調査
  const response: Error | ComAtprotoServerDeleteSession.Response =
    await this.agent.com.atproto.server.deleteSession(undefined, {
      headers: {
        authorization: `Bearer ${this.session.refreshJwt}`,
      },
    })
      .then((value) => value)
      .catch((error) => error)

  $log("deleteSession", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
