import type { BskyAgent, ComAtprotoServerCreateAccount } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  service: string,
  email: string,
  handle: string,
  password: string,
  inviteCode?: string
): Promise<undefined | Error> {
  if (!window.navigator.onLine) {
    return Error("offlineError")
  }
  if (!this.createAgent(service)) {
    return Error("noAgentError")
  }
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoServerCreateAccount.InputSchema = {
    email,
    handle,
    password,
    inviteCode
  }
  const response: Error | ComAtprotoServerCreateAccount.Response =
    await (this.agent as BskyAgent).createAccount(query)
      .then((value: ComAtprotoServerCreateAccount.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/signUp]", response)
  return response instanceof Error ? response : undefined
}
