export default async function (
  this: TIAtpWrapper,
  currentLists: Array<TTList>,
  actor: string,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  // `app.bsky.graph.getLists` はリファレンスリストを返さないため、
  // まずは `fetchRecords` でレコードを取得
  const response = await this.fetchRecords(
    actor,
    "app.bsky.graph.list",
    limit,
    cursor
  )
  if (response instanceof Error) {
    return Error("apiError")
  }

  // 次にリストを取得
  const uris = response.records.map((record) => record.uri)
  const lists = await this.fetchLists(uris)

  const newLists: Array<TTList> = lists
    .filter((list) => {
      return !currentLists.some((current: TTList) => {
        return list.uri === current.uri
      })
    })
  if (cursor == null) {
    currentLists.unshift(...newLists)
  } else {
    currentLists.push(...newLists)
  }
  return newLists.length < (limit ?? 1)
    ? undefined
    : response.cursor
}
