export default async function (
  this: TIAtpWrapper,
  lists: string[]
): Promise<TTList[]> {
  const results: TTList[] = []
  const tasks = lists.map((list: string) => {
    return this.fetchList(list)
  })
  const responses = await Promise.allSettled(tasks)
  responses.forEach((response: PromiseSettledResult<any>) => {
    if (response == null ||
        response.status === "rejected" ||
        response.value instanceof Error) {
      return
    }
    results.push(response.value)
  })
  return results
}
