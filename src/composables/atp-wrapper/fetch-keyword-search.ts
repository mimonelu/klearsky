export default async function (
  this: AbstractAtpWrapper,
  query: string
): Promise<undefined | Array<any>> {
  if (this.agent == null) return
  if (this.session == null) return
  const request = new Request(
    `http://mimonelu.net:4649/https://search.bsky.social/search/posts?q=${query}`,
    { headers: { "user-agent": "Klearsky" } }
  )
  const response = await fetch(request)
  const json: null | any = await response.json()
  if (json != null)
    json.sort((a: any, b: any) => {
      const aCreatedAt = new Date(a.post?.createdAt)
      const bCreatedAt = new Date(b.post?.createdAt)
      return aCreatedAt < bCreatedAt ? 1 : aCreatedAt > bCreatedAt ? -1 : 0
    })
  console.log("[klearsky/fetchKeywordSearch]", json)
  return json
}
