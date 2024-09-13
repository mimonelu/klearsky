import type { AppBskyActorGetProfile } from "@atproto/api"
import { PROFILE_ERRORS } from "@/consts/errors.json"

export default async function (
  this: TIAtpWrapper,
  actor: string
): Promise<Error | TTProfile> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyActorGetProfile.Response =
    await this.agent.getProfile({ actor })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getProfile]", response)
  if (response instanceof Error) {
    // エラーアカウントの場合、空のプロフィールを返す
    // WANT: message ではなく、より適切な判定方法に換装したい
    const profileError = (PROFILE_ERRORS as { [k: string]: string })[response.message]
    if (profileError != null) {
      return {
        avatar: "",
        banner: "",
        description: "",
        did: actor,
        displayName: "",
        followersCount: 0,
        followsCount: 0,
        handle: profileError,
        labels: [],
        postsCount: 0,
        viewer: {
          muted: false,
        },
      }
    }

    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as TTProfile
}
