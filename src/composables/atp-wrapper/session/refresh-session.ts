import type { BskyAgent, ComAtprotoServerRefreshSession } from "@atproto/api"
import Util from "@/composables/util"

export default async function (this: TIAtpWrapper): Promise<undefined | Error> {
  if (this.agent == null) return Error("No Agent")
  if (this.session == null) return Error("No Session")
  const response: Error | ComAtprotoServerRefreshSession.Response =
    await (this.agent as BskyAgent).com.atproto.server.refreshSession(
      undefined,
      {
        headers: {
          authorization: `Bearer ${this.session.refreshJwt}`,
        },
      }
    )
      .then((value: ComAtprotoServerRefreshSession.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/refreshSession]", response)
  if (response instanceof Error) return Error("Failed")
  this.data.did = response.data.did
  this.resetSession(response.data)

  // TODO:
  Util.saveStorage("atp", this.data)
}
