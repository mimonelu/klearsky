export default async function (
  this: TIAtpWrapper,
  preferences: Partial<TTNotificationPreferences["preferences"]>
): Promise<Error | TTNotificationPreferences> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response =
    await this.agent.app.bsky.notification.putPreferencesV2(preferences)
      .then((value) => value)
      .catch((error) => error)
  $log("putNotificationPreferencesV2", response)
  if (response instanceof Error) {
    return response
  }
  if (!response?.success || !response?.data) {
    return Error("apiError")
  }
  return response.data
}
