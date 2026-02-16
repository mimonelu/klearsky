import type { AppBskyDraftDefs } from "@atproto/api"

export default function buildPostDraft (params: {
  text: string
  url: string
  type: TTPostType
  post?: TTPost
  langs?: Array<string>
  labels: Array<string>
  draftReactionControl: TTDraftReactionControl
}): AppBskyDraftDefs.Draft {
  // deviceId の取得または生成
  let deviceId = localStorage.getItem("device-id")
  if (deviceId == null) {
    deviceId = crypto.randomUUID()
    localStorage.setItem("device-id", deviceId)
  }

  // DraftPost の組み立て
  const draftPost: AppBskyDraftDefs.DraftPost = {
    $type: "app.bsky.draft.defs#draftPost",
    text: params.text,
  }

  // ラベル
  if (params.labels.length > 0) {
    draftPost.labels = {
      $type: "com.atproto.label.defs#selfLabels",
      values: params.labels.map((val) => ({ val })),
    }
  }

  // 外部リンク
  if (params.url) {
    draftPost.embedExternals = [{
      $type: "app.bsky.draft.defs#draftEmbedExternal",
      uri: params.url,
    }]
  }

  // 引用リポスト
  if (params.type === "quoteRepost" && params.post != null) {
    draftPost.embedRecords = [{
      $type: "app.bsky.draft.defs#draftEmbedRecord",
      record: {
        uri: params.post.uri,
        cid: params.post.cid,
      },
    }]
  }

  // TODO: 画像・動画の保存

  // Draft の組み立て
  const draft: AppBskyDraftDefs.Draft = {
    $type: "app.bsky.draft.defs#draft",
    deviceId,
    deviceName: "Web",
    posts: [draftPost],
    langs: params.langs,
  }

  // 反応制限 - threadgate
  if (params.draftReactionControl.threadgateAction === "custom") {
    const allow: any[] = []
    if (params.draftReactionControl.allowMention) {
      allow.push({ $type: "app.bsky.feed.threadgate#mentionRule" })
    }
    if (params.draftReactionControl.allowFollower) {
      allow.push({ $type: "app.bsky.feed.threadgate#followerRule" })
    }
    if (params.draftReactionControl.allowFollowing) {
      allow.push({ $type: "app.bsky.feed.threadgate#followingRule" })
    }
    for (const listUri of params.draftReactionControl.listUris) {
      allow.push({ $type: "app.bsky.feed.threadgate#listRule", list: listUri })
    }
    if (allow.length > 0) {
      draft.threadgateAllow = allow
    }
  }

  // 反応制限 - postgate
  if (!params.draftReactionControl.postgateAllow) {
    draft.postgateEmbeddingRules = [{ $type: "app.bsky.feed.postgate#disableRule" }]
  }

  return draft
}
