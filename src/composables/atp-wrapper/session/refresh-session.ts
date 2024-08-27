// import type { AtpAgent, ComAtprotoServerRefreshSession } from "@atproto/api"
import Util from "@/composables/util"

export default async function (this: TIAtpWrapper): Promise<undefined | Error> {
  // TODO: 本来は @atproto/api の `com.atproto.server.refreshSession` を使用するべきだが、
  //       不明なエラーが発生するため直接サーバを叩いている。原因がわかり次第差し替えること
  const session = this.data.sessions[this.data.did]
  if (session?.__service == null) {
    return Error("noSessionError")
  }
  let hostName = ""
  try {
    const url = new URL(session.__service)
    hostName = url.hostname
  } catch (error) {
    console.warn("[klearsky/refreshSession]", error)
    return Error("refreshSessionError")
  }
  const url = `https://${hostName}/xrpc/com.atproto.server.refreshSession`
  const request: RequestInit = {
    method: "POST",
    headers: { "Authorization": `Bearer ${session.refreshJwt}` },
  }
  const response: Response = await fetch(url, request)
    .then((response: Response) => response)
    .catch((error: any) => error)
  console.log("[klearsky/refreshSession]", response)
  if (response instanceof Error) {
    return Error("refreshSessionError")
  }
  if (!response.ok) {
    return Error("refreshSessionError")
  }
  const json: Error | any = await response.json()
    .then((response: any) => response)
    .catch((error: any) => error)
  if (json instanceof Error) {
    return Error("refreshSessionError")
  }
  if (json?.did == null) {
    return Error("refreshSessionError")
  }
  this.data.did = json.did
  const responseOfResetSession = this.resetSession(json)
  if (responseOfResetSession instanceof Error) {
    return responseOfResetSession
  }

  // TODO:
  Util.saveStorage("atp", this.data)

  /*
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const response: undefined | Error =
    await (this.agent as AtpAgent).refreshSession()
      .then(() => {})
      .catch((error: any) => error)
  console.log("[klearsky/refreshSession]", response)
  if (response instanceof Error) {
    return Error("refreshSessionError")
  }

  // TODO:
  Util.saveStorage("atp", this.data)
  */
}
