import type { AppBskyUnspeccedGetTaggedSuggestions, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | TITaggedSuggestion[]> {
  if (this.agent == null) return Error("noAgentError")
  const response: AppBskyUnspeccedGetTaggedSuggestions.Response =
    await (this.agent as BskyAgent).app.bsky.unspecced.getTaggedSuggestions()
      .then((value: AppBskyUnspeccedGetTaggedSuggestions.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getTaggedSuggestions]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")

  // レスポンスを扱いやすい構造に変換
  const results: TITaggedSuggestion[] = []
  response.data.suggestions
    .forEach((suggestion: AppBskyUnspeccedGetTaggedSuggestions.Suggestion) => {
      let result = results.find((result: TITaggedSuggestion) => result.tag === suggestion.tag)
      if (result == null) {
        result = {
          tag: suggestion.tag,
          feeds: [],
          users: [],
          profiles: [],
        }
        results.push(result)
      }
      if (suggestion.subjectType === "feed") {
        result.feeds.push(suggestion.subject)
      } else if (suggestion.subjectType === "user") {
        result.users.push(suggestion.subject)
      }
    })
  results.sort((a: TITaggedSuggestion, b: TITaggedSuggestion) => {
    return a.tag < b.tag ? - 1 : a.tag > b.tag ? 1 : 0
  })

  return results
}
