import type { AppBskyActorUpdateProfile } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  params: TTUpdateProfileParams
): Promise<boolean> {
  if (this.agent == null) return false
  if (this.session == null) return false
  const fileSchemas: Array<null | TTFileSchema> = await Promise.all([
    params.avatar != null && params.avatar[0] != null
      ? this.createFileSchema(params.avatar[0], 2000, 2000)
      : null,
    params.banner != null && params.banner[0] != null
      ? this.createFileSchema(params.banner[0], 2000, 2000)
      : null,
  ])
  const avatarSchema: null | TTFileSchema = fileSchemas[0]
  const bannerSchema: null | TTFileSchema = fileSchemas[1]
  const profileSchema: AppBskyActorUpdateProfile.InputSchema = {
    displayName: params.displayName,
    description: params.description,
  }
  if (avatarSchema != null) profileSchema.avatar = avatarSchema
  if (bannerSchema != null) profileSchema.banner = bannerSchema
  const response: AppBskyActorUpdateProfile.Response =
    (await this.agent?.api.app.bsky.actor.updateProfile(profileSchema)) ?? null
  console.log("[klearsky/updateProfile]", response)
  return response.success
}
