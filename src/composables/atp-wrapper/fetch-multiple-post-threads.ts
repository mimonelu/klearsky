import {
  mergeFeeds,
  sortFeeds
} from "@/composables/atp-wrapper/services"

export default async function (
  this: TIAtpWrapper,
  postUri: string,
  rootUri?: null | string,
  parentUri?: null | string
): Promise<Array<TTFeed>> {
  const tasks: Array<Promise<null | Array<TTFeed>>> = []
  if (rootUri != null)
    tasks.push(this.fetchPostThread(rootUri))
  if (parentUri != null && parentUri != rootUri)
    tasks.push(this.fetchPostThread(parentUri))
  if (postUri != null && postUri != rootUri && postUri != parentUri)
    tasks.push(this.fetchPostThread(postUri))
  const responses: Array<null | Array<TTFeed>> = await Promise.all(tasks)
  let results: Array<TTFeed> = []
  for (const response of responses) {
    if (response != null) results = mergeFeeds(results, response)
  }
  sortFeeds(results)
  results.reverse()
  return results
}
