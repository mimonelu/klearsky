import type { AppBskyUnspeccedGetTaggedSuggestions, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<Error | TITaggedSuggestions> {
  if (this.agent == null) return Error("noAgentError")
  const response: AppBskyUnspeccedGetTaggedSuggestions.Response =
    await (this.agent as BskyAgent).app.bsky.unspecced.getTaggedSuggestions()
      .then((value: AppBskyUnspeccedGetTaggedSuggestions.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getTaggedSuggestions]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")

  // レスポンスを扱いやすい構造に変換
  const result: TITaggedSuggestions = {}
  response.data.suggestions
    .forEach((suggestion: AppBskyUnspeccedGetTaggedSuggestions.Suggestion) => {
      if (result[suggestion.tag] == null) {
        result[suggestion.tag] = {}
      }
      if (result[suggestion.tag][suggestion.subjectType] == null) {
        result[suggestion.tag][suggestion.subjectType] = []
      }
      result[suggestion.tag][suggestion.subjectType].push(suggestion.subject)
    })

  return result
}
