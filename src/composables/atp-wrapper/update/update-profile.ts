import type { AppBskyActorProfile, BlobRef, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  params: TTUpdateProfileParams
): Promise<boolean> {
  if (this.agent == null) return false

  // クエリーオブジェクト
  const profileSchema: AppBskyActorProfile.Record = {
    displayName: params.displayName,
    description: params.description,
  }

  // アカウントラベル
  if (params.labels.length > 0)
    profileSchema.labels = {
      $type: "com.atproto.label.defs#selfLabels",
      values: params.labels,
    }

  // 画像処理
  const fileBlobRefs: Array<null | BlobRef> = await Promise.all([
    params.avatar != null && params.avatar[0] != null
      ? this.createFileBlob({
          file: params.avatar[0],
          maxWidth: 2000,
          maxHeight: 2000,
          maxSize: 0.953671875,
        })
      : null,
    params.banner != null && params.banner[0] != null
      ? this.createFileBlob({
          file: params.banner[0],
          maxWidth: 3000,
          maxHeight: 1000,
          maxSize: 0.953671875,
        })
      : null,
  ])
  const avatarSchema: null | BlobRef = fileBlobRefs[0]
  const bannerSchema: null | BlobRef = fileBlobRefs[1]
  if (avatarSchema != null) profileSchema.avatar = avatarSchema
  if (bannerSchema != null) profileSchema.banner = bannerSchema

  await (this.agent as BskyAgent).upsertProfile(
    (
      existing: AppBskyActorProfile.Record | undefined
    ): AppBskyActorProfile.Record => {
      // アバター画像が未指定の場合、既存の画像を指定する
      if (!params.detachAvatar.includes(true) &&
          profileSchema.avatar == null &&
          existing?.avatar != null)
        profileSchema.avatar = existing.avatar

      // バナー画像が未指定の場合、既存の画像を指定する
      if (!params.detachBanner.includes(true) &&
          profileSchema.banner == null &&
          existing?.banner != null)
        profileSchema.banner = existing.banner

      return profileSchema
    }
  )
  return true
}
