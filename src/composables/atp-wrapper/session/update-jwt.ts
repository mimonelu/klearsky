import { jwtDecode } from "jwt-decode"

export default async function (
  this: TIAtpWrapper,
  onRefreshSession?: () => void
): Promise<undefined | Error> {
  const session = this.data.sessions[this.data.did]
  if (session == null) return Error("noSessionError")

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
  ) return Error("invalidJwtError")

  // 開発用
  const refreshDate = new Date()
  const accessDate = new Date()
  refreshDate.setTime(refreshJwt.exp * 1000)
  accessDate.setTime(accessJwt.exp * 1000)
  console.log(
    `[klearsky] refreshJwt will be expired at ${refreshDate.toLocaleString()}, ` +
    `accessJwt will be expired at ${accessDate.toLocaleString()}`
  )

  const now = Date.now() / 1000 + 60 * 5
  if (now >= refreshJwt.exp) {
    console.error("[klearsky] refreshJwt was expired.")
    return Error("refreshJwtExpired")
  }
  if (now >= accessJwt.exp) {
    console.warn("[klearsky] accessJwt was expired.")
    const response = await this.refreshSession()
    if (response instanceof Error) return response
    if (onRefreshSession != null) onRefreshSession()
  }
}
