import type { AppBskyFeedGetPostThread, BskyAgent } from "@atproto/api"
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
): Promise<undefined | false | Array<TTPost>> {
  if (this.agent == null) return
  const query: AppBskyFeedGetPostThread.QueryParams = { uri }
  if (depth != null) query.depth = depth
  const response: AppBskyFeedGetPostThread.Response =
    await (this.agent as BskyAgent).getPostThread(query)
      .then((value: AppBskyFeedGetPostThread.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPostThread]", response)
  if (!response.success) return false
  const posts: Array<TTPost> = []
  traverseThread(response.data.thread as unknown as TTThread, posts)
  Util.coherentResponses(posts)
  return posts
}

function traverseThread (thread: TTThread, results: Array<TTPost>) {
  if (thread.parent != null)
    traverseThread(thread.parent, results)
  if (thread.post != null)
    results.push(thread.post)
  if (thread.replies != null)
    thread.replies.forEach((reply: TTThread) => {
      traverseThread(reply, results)
    })
}
