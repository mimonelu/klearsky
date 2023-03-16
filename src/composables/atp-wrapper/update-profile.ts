import type { AppBskyActorUpdateProfile } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  params: UpdateProfileParams
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  const fileSchemas: Array<null | FileSchema> = await Promise.all([
    params.avatar != null && params.avatar[0] != null
      ? this.fetchFileSchema(params.avatar[0])
      : null,
    params.banner != null && params.banner[0] != null
      ? this.fetchFileSchema(params.banner[0])
      : null,
  ])
  const avatarSchema: null | FileSchema = fileSchemas[0]
  const bannerSchema: null | FileSchema = fileSchemas[1]
  const profileSchema: AppBskyActorUpdateProfile.InputSchema = {
    displayName: params.displayName,
    description: params.description,
  }
  if (avatarSchema != null) profileSchema.avatar = avatarSchema
  if (bannerSchema != null) profileSchema.banner = bannerSchema
  try {
    const response: AppBskyActorUpdateProfile.Response =
      (await this.agent?.api.app.bsky.actor.updateProfile(profileSchema)) ??
      null
    console.log("[klearsky/updateProfile]", response)
    return response.success
  } catch (error: any) {
    console.error("[klearsky/updateProfile]", error)
    return false
  }
}
