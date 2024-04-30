import Util from "@/composables/util"

const POSTED_IMAGE_REFS_ITERATION = 10
const POSTED_IMAGE_REFS_LIMIT = 100
const POSTED_IMAGE_REFS_MAX_RESULTS = 100

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | string[]> {
  const results: string[] = []
  let cursor: undefined | string
  for (let i = 0; i < POSTED_IMAGE_REFS_ITERATION; i ++) {
    const response = await this.fetchRecords(
      did,
      "app.bsky.feed.post",
      POSTED_IMAGE_REFS_LIMIT,
      cursor != null ? Util.getRkey(cursor) : undefined
    )
    if (response instanceof Error) {
      return response
    }
    const records: TICommonRecord[] = response.records
    if (!records?.length) {
      // 通常時の終了箇所
      return results.slice(0, POSTED_IMAGE_REFS_MAX_RESULTS)
    }
    records.forEach((record: TICommonRecord) => {
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
      return results.slice(0, POSTED_IMAGE_REFS_MAX_RESULTS)
    }
    cursor = lastRecord.uri
  }
  return results.slice(0, POSTED_IMAGE_REFS_MAX_RESULTS)
}
