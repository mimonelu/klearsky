import type { AppBskyActorProfile, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  params: TTUpdateProfileParams
): Promise<boolean> {
  if (this.agent == null) return false
  const fileSchemas: Array<null | TTFileSchema> = await Promise.all([
    params.avatar != null && params.avatar[0] != null
      ? this.createFileSchema({
        file: params.avatar[0],
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 976560,
        // quality: 0.8,
      })
      : null,
    params.banner != null && params.banner[0] != null
      ? this.createFileSchema({
        file: params.banner[0],
        maxWidth: 2000,
        maxHeight: 2000,
        maxSize: 976560,
        // quality: 0.8,
      })
      : null,
  ])
  const avatarSchema: null | TTFileSchema = fileSchemas[0]
  const bannerSchema: null | TTFileSchema = fileSchemas[1]
  const profileSchema: AppBskyActorProfile.Record = {
    displayName: params.displayName,
    description: params.description,
  }
  if (avatarSchema != null) profileSchema.avatar = avatarSchema
  if (bannerSchema != null) profileSchema.banner = bannerSchema
  ;(await (this.agent as BskyAgent).upsertProfile(
    (_existing: AppBskyActorProfile.Record | undefined):
      AppBskyActorProfile.Record => profileSchema
  ))
  return true
}
