import type { ComAtprotoServerGetSession } from "@atproto/api"

/**
 * 保存されたセッション情報を使ってサーバーからセッション詳細を取得
 *
 * 役割:
 * 1. 保存されたaccessJwt/refreshJwtを使ってagentにセッションを復元
 * 2. サーバーから最新のセッション情報を取得
 * 3. セッションの有効性を確認
 *
 * 使用場面:
 * - アプリ起動時の自動ログイン
 * - ローカルストレージからのセッション復元
 * - セッション有効性の確認
 */
export default async function (
  this: TIAtpWrapper,
  session: TTSession
): Promise<Error | ComAtprotoServerGetSession.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (session.accessJwt == null ||
      session.refreshJwt == null) {
    return Error("noJwtError")
  }
  const response: Error | ComAtprotoServerGetSession.Response =
    await this.agent.resumeSession({
      active: true,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      did: session.did,
      email: session.email,
      emailAuthFactor: session.emailAuthFactor,
      emailConfirmed: session.emailConfirmed,
      handle: session.handle,
      status: session.status,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/resumeSession]", response)
  if (response instanceof Error) {
    return Error("resumeSessionError")
  }
  if (!response.success) {
    return Error("resumeSessionError")
  }
  return response.data
}
