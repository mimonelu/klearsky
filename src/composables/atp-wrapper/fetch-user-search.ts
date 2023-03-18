import type { AppBskyActorSearch } from "@atproto/api"

export default async function (
  this: AbstractAtpWrapper,
  users: Array<User>,
  term: string,
  limit?: number,
  before?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  if (this.session == null) return
  const response: AppBskyActorSearch.Response =
    await this.agent.api.app.bsky.actor.search({
      term,
      limit,
      before,
    })
  console.log("[klearsky/fetchUserSearch]", response)
  if (!response.success) return

  const newUsers: Array<User> = []
  ;(response.data.users as Array<User>).forEach((target: User) => {
    if (!users.some((user: Follower) => user.did === target.did))
      newUsers.push(target)
  })
  if (before == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  return response.data.cursor
}
