import type { AppBskyDraftDefs } from "@atproto/api"
import { deleteMedia, loadMedia, saveMedia } from "@/components/next/PostDraft/post-draft-media-store"

// 下書きの組み立て
export async function buildPostDraft (params: {
  text: string
  url: string
  type: TTPostType
  post?: TTPost
  langs?: Array<string>
  labels: Array<string>
  medias: Array<File>
  alts: Array<string>
  draftReactionControl: TTDraftReactionControl
}): Promise<Error | AppBskyDraftDefs.Draft> {
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

  // メディア
  if (params.medias.length > 0) {
    const embedImages: AppBskyDraftDefs.DraftEmbedImage[] = []
    const embedVideos: AppBskyDraftDefs.DraftEmbedVideo[] = []
    for (let i = 0; i < params.medias.length; i++) {
      const file = params.medias[i]
      const key = await saveMedia(file)
      if (key instanceof Error) {
        return key
      }

      // 動画
      if (file.type.startsWith("video/")) {
        embedVideos.push({
          $type: "app.bsky.draft.defs#draftEmbedVideo",
          localRef: {
            $type: "app.bsky.draft.defs#draftEmbedLocalRef",
            path: key,
          },
          alt: params.alts[i] ?? "",
        })

      // 画像
      } else {
        embedImages.push({
          $type: "app.bsky.draft.defs#draftEmbedImage",
          localRef: {
            $type: "app.bsky.draft.defs#draftEmbedLocalRef",
            path: key,
          },
          alt: params.alts[i] ?? "",
        })
      }
    }
    if (embedImages.length > 0) {
      draftPost.embedImages = embedImages
    }
    if (embedVideos.length > 0) {
      draftPost.embedVideos = embedVideos
    }
  }

  // Draft の組み立て
  const draft: AppBskyDraftDefs.Draft = {
    $type: "app.bsky.draft.defs#draft",
    deviceId,
    deviceName: "Web",
    posts: [draftPost],
  }

  // ポスト言語
  if ((params.langs ?? []).length > 0) {
    draft.langs = params.langs
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

// 下書きにメディアが含まれるか判定
export function draftHasMedia (draft: AppBskyDraftDefs.Draft): boolean {
  return (
    (draft.posts[0]?.embedImages ?? []).length > 0 ||
    (draft.posts[0]?.embedVideos ?? []).length > 0
  )
}

// 下書きのメディアが IndexedDB に存在するか判定
export async function draftMediaExistsInStore (draft: AppBskyDraftDefs.Draft): Promise<boolean> {
  for (const post of draft.posts) {
    for (const image of post.embedImages ?? []) {
      if (image.localRef?.path == null) {
        continue
      }
      const entry = await loadMedia(image.localRef.path)
      if (entry instanceof Error || entry == null) {
        return false
      }
    }
    for (const video of post.embedVideos ?? []) {
      if (video.localRef?.path == null) {
        continue
      }
      const entry = await loadMedia(video.localRef.path)
      if (entry instanceof Error || entry == null) {
        return false
      }
    }
  }
  return true
}

// 下書きから TTSendPostPopupParams を組み立て
export async function extractSendPostPopupParams (
  draftView: AppBskyDraftDefs.DraftView,
  fallbackLangs?: Array<string>,
): Promise<TTSendPostPopupParams | undefined> {
  const draft = draftView.draft
  const post = draft.posts[0]

  // TODO: 連投機能実装後に連投下書きにも対応すること
  if (post == null || draft.posts.length >= 2) {
    return
  }

  const params: TTSendPostPopupParams = {
    action: "reuse",
    type: "post",
    draftId: draftView.id,
    text: post.text,
    url: post.embedExternals?.[0]?.uri,
    labels: (post.labels as any)?.values?.map((l: any) => l.val),
  }

  // ポスト言語
  const langs = draft.langs ?? fallbackLangs
  if ((langs ?? []).length > 0) {
    params.langs = langs
  }

  // 反応制限
  params.draftReactionControl = extractReactionControl(draft)

  // 画像
  for (const image of post.embedImages ?? []) {
    if (image.localRef?.path == null) {
      continue
    }
    const entry = await loadMedia(image.localRef.path)
    if (entry instanceof Error || entry == null) {
      continue
    }
    if (params.medias == null) {
      params.medias = []
    }
    params.medias.push({
      image: entry.blob as unknown as TIBlob,
      alt: image.alt ?? "",
    })
  }

  // 動画
  for (const video of post.embedVideos ?? []) {
    if (video.localRef?.path == null) {
      continue
    }
    const entry = await loadMedia(video.localRef.path)
    if (entry instanceof Error || entry == null) {
      continue
    }
    if (params.medias == null) {
      params.medias = []
    }
    params.medias.push({
      video: entry.blob as unknown as TIBlob,
      alt: video.alt ?? "",
    })
  }

  return params
}

// 反応制限の抽出
export function extractReactionControl (draft: AppBskyDraftDefs.Draft): TTDraftReactionControl {
  const rc: TTDraftReactionControl = {
    postgateAllow: true,
    threadgateAction: "none",
    allowMention: false,
    allowFollower: false,
    allowFollowing: false,
    listUris: [],
  }
  if (draft.threadgateAllow != null) {
    rc.threadgateAction = "custom"
    for (const allow of draft.threadgateAllow) {
      if (allow.$type.includes("mentionRule")) {
        rc.allowMention = true
      } else if (allow.$type.includes("followerRule")) {
        rc.allowFollower = true
      } else if (allow.$type.includes("followingRule")) {
        rc.allowFollowing = true
      } else if (allow.$type.includes("listRule") && (allow as any).list != null) {
        rc.listUris.push((allow as any).list)
      }
    }
  }
  if (draft.postgateEmbeddingRules?.some((rule) => {
    return rule.$type === "app.bsky.feed.postgate#disableRule"
  })) {
    rc.postgateAllow = false
  }
  return rc
}

// 下書きの削除（API + IndexedDB メディア）
export async function deleteDraftWithMedia (
  atp: TIAtpWrapper,
  draftView: AppBskyDraftDefs.DraftView,
): Promise<Error | void> {
  const response = await atp.deleteDraft(draftView.id)
  if (response instanceof Error) {
    return response
  }
  return await deleteDraftMedia(draftView.draft)
}

// 下書きに紐づくメディアを IndexedDB から削除
export async function deleteDraftMedia (draft: AppBskyDraftDefs.Draft): Promise<Error | void> {
  for (const post of draft.posts) {
    for (const image of post.embedImages ?? []) {
      if (image.localRef?.path != null) {
        const result = await deleteMedia(image.localRef.path)
        if (result instanceof Error) {
          return result
        }
      }
    }
    for (const video of post.embedVideos ?? []) {
      if (video.localRef?.path != null) {
        const result = await deleteMedia(video.localRef.path)
        if (result instanceof Error) {
          return result
        }
      }
    }
  }
}
