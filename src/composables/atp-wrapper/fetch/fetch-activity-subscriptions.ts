import type { AppBskyNotificationListActivitySubscriptions } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  items: Array<TTUser>,
  limit?: number,
  cursor?: string
): Promise<Error | undefined | string> {
  if (!this.agent) {
    return Error("noAgentError")
  }
  const query: AppBskyNotificationListActivitySubscriptions.QueryParams = {
    limit,
    cursor,
  }
  const response: Error | AppBskyNotificationListActivitySubscriptions.Response =
    await this.agent.app.bsky.notification.listActivitySubscriptions(query)
      .then((value) => value)
      .catch((error) => error)
  $log("fetchActivitySubscriptions", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  const newItems: Array<TTUser> = []
  ;(response.data.subscriptions as Array<any>)
    .forEach((newItem: TTUser) => {
      if (!items.some((item: TTUser) => item.did === newItem.did)) {
        newItems.push(newItem)
      }
    })
  if (cursor == null) {
    items.unshift(...newItems)
  } else {
    items.push(...newItems)
  }

  return response.data.cursor
}
