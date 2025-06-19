export default async function (this: TIAtpWrapper): Promise<Error | TTNotificationPreferences> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response =
    await this.agent.app.bsky.notification.getPreferences()
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/getNotificationPreferences]", response)
  if (response instanceof Error) {
    return response
  }
  if (
    !response?.success ||
    !response?.data?.preferences
  ) {
    return Error("apiError")
  }
  return response.data
}
