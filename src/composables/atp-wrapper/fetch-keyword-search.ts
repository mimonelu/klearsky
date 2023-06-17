export default async function (
  this: TIAtpWrapper,
  query: string
): Promise<undefined | false | Array<TTPost>> {
  // TODO: デモ用のAPIにアクセスしている
  //       将来的には正規のAPIを使用すること
  const encodedQuery = encodeURIComponent(query)
  const request = new Request(`https://search.bsky.social/search/posts?q=${encodedQuery}`)
  const response = await fetch(request)
  const json: null | any = await response.json()
  console.log("[klearsky/fetchKeywordSearch]", json)
  if (!Array.isArray(json)) return false

  // 　ポストの取得
  // TODO: getPosts は２５ポスト以下でなければエラーとなるため処理を分割している
  //       将来的にはページネーションを採用すること
  const tasks = []
  const NUMBER_OF_POST_IN_PAGE = 15
  for (let i = 0, ii = json.length; i < ii; i += NUMBER_OF_POST_IN_PAGE) {
    const uris = json
      .slice(i, i + NUMBER_OF_POST_IN_PAGE)
      .map((data: any) => `at://${data.user?.did ?? ""}/${data.tid}`)
    tasks.push(this.fetchPosts(uris))
  }
  const results = await Promise.allSettled(tasks)
  let errored = false
  const posts = results.map((result: any) => {
    if (result.value == null) return []
    if (result.value === false) {
      errored = true
      return []
    }
    return result.value
  }).flat()

  // TODO: ここでエラーメッセージを非同期で表示したい
  // if (errored) ...

  // 取りこぼし対策
  // TODO: おそらく bsky.social 以外のPDS。後日正式に対応すること
  if (json.length > posts.length) {
    json
      .filter((item: any) => posts.every((post: TTPost) => post.cid !== item.cid))
      .forEach((dropout: any) => {
        const createdAtDate = new Date()
        createdAtDate.setTime(dropout.post.createdAt / 1000 / 1000)
        const createdAt = createdAtDate.toISOString()
        posts.push({
          forcePosition: "preview",
          author: {
            did: dropout.user.did,
            displayName: "(Non-existent account)",
            handle: dropout.user.handle,
            viewer: {},
          },
          cid: dropout.cid,
          indexedAt: createdAt,
          likeCount: 0,
          record: {
            $type: "app.bsky.feed.post",
            createdAt,
            text: dropout.post.text,
          },
          replyCount: 0,
          repostCount: 0,
          uri: "",
          viewer: {},
          __custom: {},
        })
      })
  }

  // ポストのソート
  posts.sort((a: any, b: any) => {
    const aIndexedAt = new Date(a.indexedAt)
    const bIndexedAt = new Date(b.indexedAt)
    return aIndexedAt < bIndexedAt ? 1 : aIndexedAt > bIndexedAt ? -1 : 0
  })

  return posts
}
