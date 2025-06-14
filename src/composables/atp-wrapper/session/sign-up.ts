import type { ComAtprotoServerCreateAccount } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  service: string,
  email: string,
  handle: string,
  password: string,
  inviteCode?: string
): Promise<Error | undefined> {
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
    await this.agent.createAccount(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/signUp]", response)
  if (response instanceof Error) {
    return response
  }
}
