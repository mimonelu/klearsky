import { jwtDecode } from "jwt-decode"

export default async function (
  this: TIAtpWrapper,
  onRefreshSession?: () => void
): Promise<Error | undefined> {
  const session = this.data.sessions[this.data.did]
  if (session == null) {
    return Error("noSessionError")
  }
  if (session.refreshJwt == null ||
      session.accessJwt == null
  ) {
    return Error("noJwtError")
  }
  let refreshJwt = undefined
  let accessJwt = undefined
  try {
    refreshJwt = jwtDecode(session.refreshJwt)
    accessJwt = jwtDecode(session.accessJwt)
  } catch (error) {
    return Error("jwtDecodeError")
  }
  if (
    refreshJwt.exp == null ||
    accessJwt.exp == null
  ) {
    return Error("invalidJwtError")
  }

  const now = Date.now() / 1000 + 60 * 5
  if (now >= refreshJwt.exp) {
    // 開発用
    const refreshDate = new Date()
    refreshDate.setTime(refreshJwt.exp * 1000)
    console.warn(`[klearsky] refreshJwt was expired at ${refreshDate.toLocaleString()}.`)

    return Error("refreshJwtExpired")
  }
  if (now >= accessJwt.exp) {
    // 開発用
    const accessDate = new Date()
    accessDate.setTime(accessJwt.exp * 1000)
    console.warn(`[klearsky] accessJwt was expired at ${accessDate.toLocaleString()}.`)

    const response = await this.refreshSession()
    if (response instanceof Error) {
      return response
    }

    // TODO: Error でなければ onRefreshSession を実行するように修正
    if (onRefreshSession != null) {
      onRefreshSession()
    }
  }
}
