import type { BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<undefined | Error> {
  if (this.agent == null) return Error("No Agent")
  const response: void | Error =
    await (this.agent as BskyAgent).unblockModList(listUri)
      .then((value: any) => value)
      .catch((error: any) => error)
  console.log("[klearsky/unblockModList]", response)
  if (response instanceof Error) return response
}
