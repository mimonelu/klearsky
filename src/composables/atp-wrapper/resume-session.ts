import type { ComAtprotoSessionGet } from "@atproto/api"
import storage from "@/composables/storage"

export default async function (
  this: AbstractAtpWrapper,
  newHandle?: string
): Promise<boolean> {
  if (this.agent == null) return false
  const handle = newHandle ?? storage.load("handle")
  if (handle == null) return false
  this.session = storage.load(handle)
  if (this.session == null) return false
  try {
    const response: ComAtprotoSessionGet.Response =
      await this.agent.resumeSession(this.session)
    return response.success
  } catch (error: any) {
    console.error("[klearsky/resumeSession]", error)
    return false
  }
}
