import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  starterPack: TIStarterPack
): Promise<Error | string> {
  const rkey = Util.getRkey(starterPack.uri)
  const response: Error | Response = await Util.fetchWithTimeout("https://go.bsky.app/link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: `/start/${starterPack.creator?.did}/${rkey}`,
    }),
    mode: "cors",
  })
    .then((value) => value)
    .catch((error) => error)

  // DoS攻撃対策
  await Util.wait(1000)

  console.log("[klearsky/go.bsky.app/link]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.ok) {
    return Error("apiError")
  }
  const result = await response.json()
  if (result?.url == null) {
    return Error("noUrl")
  }
  return result.url
}
