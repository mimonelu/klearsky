import { jwtDecode } from "jwt-decode"

export default async function (
  this: TIAtpWrapper,
  onRefreshSession?: () => void
): Promise<boolean> {
  const session = this.data.sessions[this.data.did]
  if (session == null) return false

  let refreshJwt = undefined
  let accessJwt = undefined
  try {
    refreshJwt = jwtDecode(session.refreshJwt)
    accessJwt = jwtDecode(session.accessJwt)
  } catch (error) {
    throw "jwtDecodeFailed"
  }
  if (
    refreshJwt.exp == null ||
    accessJwt.exp == null
  ) return false

  // 開発用
  const refreshDate = new Date()
  const accessDate = new Date()
  refreshDate.setTime(refreshJwt.exp * 1000)
  accessDate.setTime(accessJwt.exp * 1000)
  console.log(
    `[klearsky] refreshJwt will be expired at ${refreshDate.toLocaleString()}\n` +
    `[klearsky] accessJwt will be expired at ${accessDate.toLocaleString()}`
  )

  const now = Date.now() / 1000 + 60 * 5
  if (now >= refreshJwt.exp) {
    console.error("[klearsky] refreshJwt was expired.")
    throw { error: "sessionExpired" }
  }
  if (now >= accessJwt.exp) {
    console.warn("[klearsky] accessJwt was expired.")
    const response = await this.refreshSession()
    if (response == null) {
      if (onRefreshSession != null) onRefreshSession()
    }
  }

  return true
}
