import type { ComAtprotoRepoApplyWrites } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }

  // 複製元リストの取得
  const srcList = await this.fetchList(listUri)
  if (srcList instanceof Error) {
    return srcList
  }

  // 複製先リストの作成
  const dstListUri = await this.createList(
    srcList.purpose,
    appendWithLimit(srcList.name, " (duplicate)", 64),
    appendWithLimit(srcList.description ?? "", `\n* This list is a duplicate of ${srcList.uri}`, 300),
  )
  if (dstListUri instanceof Error) {
    return dstListUri
  }

  // 複製元リストアイテムの取得
  const items: Array<TTListItem> = []
  let cursor = undefined
  for (let i = 0; i < 10; i ++) {
    const result = await this.fetchListItems(items, listUri, 100, cursor)
    if (result instanceof Error) {
      // TODO:
      break
    }
    if (result == null) {
      break
    }
    cursor = result
  }

  // `applyWrites` のリミット 200 ごとにチャンク分け
  const chunkedItems = chunkArray(items, 200)

  // 複製先リストアイテムの作成
  for (const items of chunkedItems) {
    const createdAt = new Date().toISOString()
    const response: Error | ComAtprotoRepoApplyWrites.Response =
      await this.agent.com.atproto.repo.applyWrites({
        repo: this.session.did,
        writes: items.map((item) => {
          return {
            $type: "com.atproto.repo.applyWrites#create",
            collection: "app.bsky.graph.listitem",
            value: {
              $type: "app.bsky.graph.listitem",
              createdAt,
              list: dstListUri,
              subject: item.subject.did,
            },
          }
        }),
      })
        .then((value) => value)
        .catch((error) => error)
    console.log('[klearsky/applyWrites]', response)
    if (response instanceof Error) {
      return response
    }
    if (!response.success) {
      return Error("apiError")
    }
  }

  return dstListUri
}

// TODO: grapheme で換装
function appendWithLimit (a: string, b: string, limit: number = 100): string {
  const combinedLength = a.length + b.length
  if (combinedLength > limit) {
    const truncatedLength = limit - b.length
    return a.slice(0, Math.max(0, truncatedLength)) + b
  }
  return a + b
}

function chunkArray<T> (array: T[], chunkSize: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
