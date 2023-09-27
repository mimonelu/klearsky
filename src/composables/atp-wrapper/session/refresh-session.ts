import Util from "@/composables/util"

export default async function (this: TIAtpWrapper): Promise<boolean> {
  if (this.session == null) return false

  // TODO: 本来は @atproto/api の `com.atproto.server.refreshSession` を使用するべきだが、
  //       不明なエラーが発生するため直接サーバを叩いている。原因がわかり次第差し替えること
  const domain = this.session.__service?.replace(/^\w+:\/+/, "") ?? ""
  const url = `https://${domain}/xrpc/com.atproto.server.refreshSession`
  const request: RequestInit = {
    method: "POST",
    headers: { "Authorization": `Bearer ${this.session.refreshJwt}` },
  }
  const json: any = await fetch(url, request).then(async (response: Response) => {
    console.log("[klearsky/refreshSession]", response)
    if (!response.ok) return undefined
    return await response.json()
  })

  if (json?.did == null) return false
  this.data.did = json.did
  this.resetSession(json)

  // TODO:
  Util.saveStorage("atp", this.data)

  return true
}
