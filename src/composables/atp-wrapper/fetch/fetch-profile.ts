import type { AppBskyActorGetProfile, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actor: string
): Promise<Error | TTProfile> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyActorGetProfile.Response =
    await (this.agent as AtpAgent).getProfile({ actor })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getProfile]", response)
  if (response instanceof Error) {
    // 無効化されたアカウントの場合、空のプロフィールを返す
    // WANT: message ではなく、より適切な判定方法に換装したい
    if (response.message === "Account is deactivated") {
      return {
        avatar: "",
        banner: "",
        description: "",
        did: actor,
        displayName: "deactivatedAccount",
        followersCount: 0,
        followsCount: 0,
        handle: "deactivatedAccount",
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
