export default async function (this: TIAtpWrapper): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false

  // TODO: 本来は @atproto/api の `com.atproto.server.refreshSession` を使用するべきだが、
  //       不明なエラーが発生するため直接サーバを叩いている。原因がわかり次第差し替えること
  const request: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + this.session.refreshJwt,
    },
  }
  const domain = this.session.__service?.replace(/^\w+:\/+/, "") ?? ""
  const json: any = await fetch(`https://${domain}/xrpc/com.atproto.server.refreshSession`, request)
    .then((response: Response) => {
      console.log("[klearsky/refreshSession]", response)
      return response.json()
    })
  if (json?.did == null) return false
  this.data.did = json.did
  this.data.sessions[this.data.did] = json as TTSession
  this.data.sessions[this.data.did].__service = this.session.__service
  json.email = this.session.email
  this.session = json

  return true
}
