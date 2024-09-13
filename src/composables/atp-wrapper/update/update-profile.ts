import type { AppBskyActorProfile, BlobRef } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  params: TTUpdateProfileParams
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  // クエリーオブジェクト
  const profileSchema: AppBskyActorProfile.Record = {}

  // 表示名
  if (params.displayName != null) {
    profileSchema.displayName = params.displayName
  }

  // 説明文
  if (params.description != null) {
    profileSchema.description = params.description
  }

  // アカウントラベル
  if (params.labels.length > 0) {
    profileSchema.labels = {
      $type: "com.atproto.label.defs#selfLabels",
      values: params.labels.map((label: string) => {
        return {
          src: this.data.did,
          uri: `at://${this.data.did}/app.bsky.actor.profile/self`,
          val: label,
          cts: new Date().toISOString(),
        }
      }),
    }
  }

  // 画像処理
  const fileBlobRefs: Array<Error | null | BlobRef> = await Promise.all([
    params.avatar != null && params.avatar[0] != null
      ? this.createFileBlobRef({
          file: params.avatar[0],
          maxWidth: 2000,
          maxHeight: 2000,
          maxSize: 0.953671875,
        })
      : null,
    params.banner != null && params.banner[0] != null
      ? this.createFileBlobRef({
          file: params.banner[0],
          maxWidth: 3000,
          maxHeight: 1000,
          maxSize: 0.953671875,
        })
      : null,
  ])
  const avatarSchema = fileBlobRefs[0]
  if (!(avatarSchema instanceof Error) && avatarSchema != null) {
    profileSchema.avatar = avatarSchema
  }
  const bannerSchema = fileBlobRefs[1]
  if (!(bannerSchema instanceof Error) && bannerSchema != null) {
    profileSchema.banner = bannerSchema
  }

  // 固定ポスト
  if (params.pinnedPost != null) {
    profileSchema.pinnedPost = params.pinnedPost
  }

  try {
    await this.agent.upsertProfile(
      (existing: AppBskyActorProfile.Record | undefined): AppBskyActorProfile.Record => {
        // アバター画像が未指定の場合、既存の画像を指定する
        if (!params.detachAvatar.includes(true) &&
            profileSchema.avatar == null &&
            existing?.avatar != null) {
          profileSchema.avatar = existing.avatar
        }

        // バナー画像が未指定の場合、既存の画像を指定する
        if (!params.detachBanner.includes(true) &&
            profileSchema.banner == null &&
            existing?.banner != null) {
          profileSchema.banner = existing.banner
        }

        return profileSchema
      }
    )
  } catch (error: any) {
    console.log("[klearsky/upsertProfile]", error)
    return error
  }
}
