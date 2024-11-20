// TODO: 現状未使用
export default async function (
  this: TIAtpWrapper,
  q: string
): Promise<Error | Array<TIStarterPack>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | any =
    await this.fetchWithoutAgent(
      "app.bsky.graph.searchStarterPacks",
      this.data.did,
      {
        q,
      }
    )
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchStarterPacksSearch]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success || response.data?.starterPacks == null) {
    return Error("apiError")
  }
  return response.data.starterPacks as unknown as Array<TIStarterPack>
}
