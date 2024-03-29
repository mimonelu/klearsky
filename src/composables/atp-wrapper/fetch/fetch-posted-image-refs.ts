import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | string[]> {
  const results: string[] = []
  let cursor: undefined | string
  for (let i = 0; i < 10; i ++) { // TODO:
    const query: Record<string, string> = {
      collection: "app.bsky.feed.post",
      repo: did,
      limit: "100", // TODO:
    }
    if (cursor != null) {
      query.rkeyEnd = Util.getRkey(cursor)
    }
    const response = await this.fetchWithoutAgent("com.atproto.repo.listRecords", did, query)
    if (response instanceof Error) {
      return response
    }
    if (response == null) {
      return results
    }
    const data = await response.json()
    if (data == null) {
      return results
    }
    const records: undefined | TTRecord[] = data.records
    if (!records?.length) {
      // 通常時の終了箇所
      return results
    }
    records.forEach((record: TTRecord) => {
      const images = record.value?.embed?.images
      if (images == null) {
        return
      }
      images.forEach((image: TTImage) => {
        const ref = image.image?.ref?.$link
        if (ref == null) {
          return
        }
        results.push(ref)
      })
    })
    const lastRecord = records.at(- 1)
    if (lastRecord?.uri == null) {
      return results
    }
    cursor = lastRecord.uri
  }
  return results.splice(0, 100) // TODO:
}
