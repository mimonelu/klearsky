import type { AppBskyActorProfile, BlobRef } from "@atproto/api"
import CONSTS from "@/consts/consts.json"

export default async function (
  this: TIAtpWrapper,
  params: TTUpdateProfileParams
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  // クエリーオブジェクト
  const profileSchema: AppBskyActorProfile.Record = {
    $type: "app.bsky.actor.profile",
  }

  // 表示名
  if (params.displayName != null) {
    profileSchema.displayName = params.displayName
  }

  // 説明文
  if (params.description != null) {
    profileSchema.description = params.description
  }

  // プロナウンス
  if (params.pronouns != null) {
    profileSchema.pronouns = params.pronouns
  }

  // WebサイトのURL
  // NOTICE: 空文字列の `website` がバリデーションで弾かれる現象対策
  if (params.website?.length >= 1) {
    profileSchema.website = params.website
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
          maxSize: CONSTS.MAX_IMAGE_FILE_SIZE,
        })
      : null,
    params.banner != null && params.banner[0] != null
      ? this.createFileBlobRef({
          file: params.banner[0],
          maxWidth: 3000,
          maxHeight: 1000,
          maxSize: CONSTS.MAX_IMAGE_FILE_SIZE,
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

  try {
    await this.agent.upsertProfile(
      (existing: AppBskyActorProfile.Record | undefined): AppBskyActorProfile.Record => {
        // 本関数で扱わないフィールドは既存の値を引き継ぐ
        const record: AppBskyActorProfile.Record = {
          ...existing,
          ...profileSchema,
        }

        // 未指定のフィールドは削除する
        if (profileSchema.website == null) {
          delete record.website
        }
        if (profileSchema.labels == null) {
          delete record.labels
        }

        // 画像が未指定の場合は既存の画像を引き継ぎ、取り外し指定時のみ削除する
        if (params.detachAvatar.includes(true) && profileSchema.avatar == null) {
          delete record.avatar
        }
        if (params.detachBanner.includes(true) && profileSchema.banner == null) {
          delete record.banner
        }

        return record
      }
    )
  } catch (error: any) {
    $log("upsertProfile", error)
    return error
  }
}
