import type { AppBskyActorSearch } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  users: Array<TTUser>,
  term: string,
  limit?: number,
  before?: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const response: AppBskyActorSearch.Response =
    await this.agent.api.app.bsky.actor.search({
      term,
      limit,
      before,
    })
  console.log("[klearsky/fetchUserSearch]", response)
  if (!response.success) return

  const newUsers: Array<TTUser> = []
  ;(response.data.users as Array<TTUser>).forEach((target: TTUser) => {
    if (!users.some((user: TTUser) => user.did === target.did))
      newUsers.push(target)
  })
  if (before == null) users.unshift(...newUsers)
  else users.push(...newUsers)

  return response.data.cursor
}
