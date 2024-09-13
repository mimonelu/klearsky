import type { AppBskyFeedGetPostThread } from "@atproto/api"
import Util from "@/composables/util"

interface TTThread {
  parent: TTThread
  post: TTPost
  replies: Array<TTThread>
}

export default async function (
  this: TIAtpWrapper,
  uri: string,
  depth?: number
): Promise<Error | Array<TTPost>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyFeedGetPostThread.QueryParams = { uri }
  if (depth != null) {
    query.depth = depth
  }
  const response: Error | AppBskyFeedGetPostThread.Response =
    await this.agent.getPostThread(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getPostThread]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  const posts: Array<TTPost> = []
  if (response.data?.thread != null) {
    traverseThread(response.data.thread as unknown as TTThread, posts)
  }
  Util.sanitizePostsOrFeeds(posts)
  return posts
}

function traverseThread (thread: TTThread, results: Array<TTPost>) {
  if (thread.parent != null) {
    traverseThread(thread.parent, results)
  }
  if (thread.post != null) {
    results.push(thread.post)
  }
  if (thread.replies != null) {
    thread.replies.forEach((reply: TTThread) => {
      traverseThread(reply, results)
    })
  }
}
