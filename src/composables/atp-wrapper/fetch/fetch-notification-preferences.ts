export default async function (this: TIAtpWrapper): Promise<Error | TTNotificationPreferences> {
  if (this.agent == null) {
    return Error("noAgentError")
  }

  try {
    const response = await this.agent.api.app.bsky.notification.getPreferences()
    console.log("[klearsky/getNotificationPreferences]", response)
    
    if (!response.success) {
      return Error("apiError")
    }

    return response.data
  } catch (error) {
    console.error("[klearsky/getNotificationPreferences]", error)
    return error instanceof Error ? error : Error("apiError")
  }
}