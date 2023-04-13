import type { BskyAgent, ComAtprotoServerDeleteSession } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false

  // TODO: API は成功するが、セッションが削除されない。要調査
  const response: ComAtprotoServerDeleteSession.Response =
    await (this.agent as BskyAgent).api.com.atproto.server.deleteSession(
      undefined,
      {
        headers: {
          authorization: `Bearer ${this.session.refreshJwt}`
        },
      }
    )

  console.log("[klearsky/deleteSession]", response)
  return response.success
}
