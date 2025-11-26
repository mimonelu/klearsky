import type { AppBskyNotificationListNotifications } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  currentValues: Array<TTNotificationGroup>,
  reasons?: Array<TTNotificationStrictReason>,
  limit?: number,
  cursor?: string
): Promise<Error | {
  cursor?: string
  newNotificationCount: number
}> {
  // エージェントの存在確認
  if (this.agent == null) {
    return Error("noAgentError")
  }

  // クエリパラメータの設定
  const query: AppBskyNotificationListNotifications.QueryParams = {}
  if (reasons != null) {
    query.reasons = reasons
  }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }

  // 通知を取得
  const response: Error | AppBskyNotificationListNotifications.Response =
    await this.agent.listNotifications(query)
      .then((value) => value)
      .catch((error) => error)
  $log("listNotifications", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }

  // 新着通知数
  let newNotificationCount = 0

  // 新しい通知グループを作成
  const newValues: Array<TTNotificationGroup> = [...currentValues]

  // 取得した通知を処理
  response.data.notifications
    .forEach((notification: AppBskyNotificationListNotifications.Notification) => {
      // 既存の通知かどうかを確認
      const existence = currentValues.some((valueGroup: TTNotificationGroup) => {
        return valueGroup.notifications.some((value: TTNotification) => {
          return value.uri === notification.uri
        })
      })
      if (existence) {
        return
      }

      // 新着通知数のカウント
      if (cursor == null) {
        newNotificationCount ++
      }

      // 通知種別
      const reason =
        // フィードジェネレーターへのいいねは `likeGenerator` として扱う
        notification.reason === "like" && isSubjectFeedGenerator(notification.reasonSubject)
          ? "likeGenerator"
          : notification.reason

      // 通知対象を設定
      const reasonSubject = (() => {
        switch (notification.reason) {
          case "mention": {
            return notification.uri
          }
          case "follow": {
            return notification.author.handle
          }
          case "like-via-repost":
          case "repost-via-repost": {
            return (notification.record as any).subject.uri
          }
        }
        return notification.reasonSubject
      })()

      // 新しい通知オブジェクトの作成
      const newNotification: TTNotification = {
        avatar: notification.author.avatar,
        cid: notification.cid,
        did: notification.author.did,
        displayName: notification.author.displayName,
        handle: notification.author.handle,
        following: notification.author.viewer?.following != null,
        indexedAt: notification.indexedAt,
        isSubscribedReply:
          notification.reason === "subscribed-post" &&
          notification.record?.reply != null,
        reason: notification.reason as TTNotificationReason,
        text: notification.reason === "follow"
          ? notification.author.description
          : notification.record?.text as undefined | string,
        uri: notification.uri,
        isRead: notification.isRead,
      }

      // 通知グループの検索と追加
      const existenceGroup = newValues.find((value: TTNotificationGroup) => {
        return value.reason === reason && value.reasonSubject === reasonSubject
      })
      if (existenceGroup == null) {
        newValues.push({
          id: notification.cid,
          indexedAt: new Date(notification.indexedAt),
          notifications: [newNotification],
          reason: reason as TTNotificationReason,
          reasonSubject,
          __folding: true,
        })
      } else {
        existenceGroup.notifications.push(newNotification)
      }
    }
  )

  // ポスト詳細の取得
  const postUris: Set<string> = new Set()
  newValues.forEach((group: TTNotificationGroup) => {
    if (group.post != null) {
      return
    }

    // ポスト関連の通知のみを処理
    if (
      group.reason === "like" ||
      group.reason === "like-via-repost" ||
      group.reason === "quote" ||
      group.reason === "reply" ||
      group.reason === "repost" ||
      group.reason === "repost-via-repost"
    ) {
      // 特殊なケースの処理
      if (group.reason === "quote") {
        // フィードジェネレーターの引用リポストはスキップ
        if (isSubjectFeedGenerator(group.reasonSubject)) {
          return
        }

        // リストの引用リポストはスキップ
        if (isSubjectList(group.reasonSubject)) {
          return
        }

        // スターターパックの引用リポストはスキップ
        if (isSubjectStarterPack(group.reasonSubject)) {
          return
        }
      }

      postUris.add(group.reasonSubject as string)
    }
  })

  // ポスト情報の取得と設定
  const posts: Error | Array<TTPost> = await this.fetchPosts(Array.from(postUris))
  if (posts instanceof Error) {
    return posts
  }

  // ポスト情報の設定
  if (Array.isArray(posts)) {
    newValues.forEach((value: TTNotificationGroup) => {
      const post: undefined | TTPost = posts.find((post: TTPost) => {
        return value.reasonSubject === post.uri
      })
      if (post != null) {
        value.post = post
      }
    })
  }

  // フィードジェネレーターの取得
  const generatorUris: Set<string> = new Set()
  newValues.forEach((group: TTNotificationGroup) => {
    if (group.generator != null) {
      return
    }
    if (group.reason === "likeGenerator" ||
      (
        group.reason === "quote" &&
        isSubjectFeedGenerator(group.reasonSubject)
      )
    ) {
      generatorUris.add(group.reasonSubject as string)
    }
  })
  if (generatorUris.size > 0) {
    const generators: Error | Array<TTFeedGenerator> =
      await this.fetchFeedGenerators(Array.from(generatorUris))
    if (!(generators instanceof Error)) {
      newValues.forEach((value: TTNotificationGroup) => {
        const generator: undefined | TTFeedGenerator = generators
          .find((generator: TTFeedGenerator) => {
            return value.reasonSubject === generator.uri
          })
        if (generator != null) {
          value.generator = generator
        }
      })
    }
  }

  // リストの取得
  const listUris: Set<string> = new Set()
  newValues.forEach((group: TTNotificationGroup) => {
    if (group.list != null) {
      return
    }
    if (group.reason === "quote" && isSubjectList(group.reasonSubject)) {
      listUris.add(group.reasonSubject as string)
    }
  })
  if (listUris.size > 0) {
    const lists: Array<TTList> = await this.fetchLists(Array.from(listUris))
    newValues.forEach((value: TTNotificationGroup) => {
      const list: undefined | TTList = lists
        .find((list: TTList) => {
          return value.reasonSubject === list.uri
        })
      if (list != null) {
        value.list = list
      }
    })
  }

  // スターターパックの取得
  const starterPackUris: Set<string> = new Set()
  newValues.forEach((group) => {
    if (group.starterPack != null) {
      return
    }
    if (group.reason === "quote" && isSubjectStarterPack(group.reasonSubject)) {
      starterPackUris.add(group.reasonSubject as string)
    }
  })
  if (starterPackUris.size > 0) {
    const starterPacks = await this.fetchStarterPacks(Array.from(starterPackUris))
    if (!(starterPacks instanceof Error)) {
      newValues.forEach((value) => {
        const starterPack = starterPacks
          .find((starterPack) => {
            return value.reasonSubject === starterPack.uri
          })
        if (starterPack != null) {
          value.starterPack = starterPack
        }
      })
    }
  }

  // 現在の通知グループを更新
  currentValues.splice(0, currentValues.length, ...newValues)

  // 新着通知があればフォールディングを展開する（いいねとリポスト以外）
  if (cursor === undefined) {
    currentValues.forEach((value: TTNotificationGroup) => {
      if (
        value.reason === "like" ||
        value.reason === "like-via-repost" ||
        value.reason === "repost" ||
        value.reason === "repost-via-repost"
      ) {
        return
      }
      const hasRead = value.notifications
        .some((notification: TTNotification) => {
          return !notification.isRead
        })
      value.__folding = !hasRead
    })
  }

  // 通知配列のソート（時系列順）
  currentValues.forEach((value: TTNotificationGroup) => {
    value.notifications.sort((a: TTNotification, b: TTNotification) => {
      const aDate = new Date(a.indexedAt)
      const bDate = new Date(b.indexedAt)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })
  })

  // 通知グループのソート（時系列順）
  currentValues.forEach((group: TTNotificationGroup) => {
    group.notifications.forEach((notification: TTNotification) => {
      const date = new Date(notification.indexedAt)
      if (group.indexedAt < date) {
        group.indexedAt = date
      }
    })
  })
  currentValues.sort((a: TTNotificationGroup, b: TTNotificationGroup) => {
    return a.indexedAt < b.indexedAt ? 1 : a.indexedAt > b.indexedAt ? - 1 : 0
  })

  return {
    cursor: response.data.cursor,
    newNotificationCount,
  }
}

// 通知の対象がフィードジェネレーターかどうかを判定
function isSubjectFeedGenerator (reasonSubject?: string): boolean {
  return (reasonSubject?.indexOf("/app.bsky.feed.generator/") ?? - 1) !== - 1
}

// 通知の対象がリストかどうかを判定
function isSubjectList (reasonSubject?: string): boolean {
  return (reasonSubject?.indexOf("/app.bsky.graph.list/") ?? - 1) !== - 1
}

// 通知の対象がスターターパックかどうかを判定
function isSubjectStarterPack (reasonSubject?: string): boolean {
  return (reasonSubject?.indexOf("/app.bsky.graph.starterpack/") ?? - 1) !== - 1
}
