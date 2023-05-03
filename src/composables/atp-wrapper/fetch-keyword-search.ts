export default async function (
  this: TIAtpWrapper,
  query: string
): Promise<undefined | Array<any>> {
  const request = new Request(
    `https://mimonelu.net:4649/https://search.bsky.social/search/posts?q=${query}`,
    { headers: { "user-agent": "Klearsky" } }
  )
  const response = await fetch(request)
  const json: null | any = await response.json()
  if (json == null) return
  json.forEach(async (data: any) => {
    if (data.post == null) return
    const date = new Date()
    date.setTime(data.post.createdAt / 1000 / 1000)
    data.post.createdAt = date.toISOString()
    data.uri = `at://${data.user?.did}/${data.tid}`
  })

  json.sort((a: any, b: any) => {
    const aCreatedAt = new Date(a.post?.createdAt)
    const bCreatedAt = new Date(b.post?.createdAt)
    return aCreatedAt < bCreatedAt ? 1 : aCreatedAt > bCreatedAt ? -1 : 0
  })
  console.log("[klearsky/fetchKeywordSearch]", json)
  return json
}
