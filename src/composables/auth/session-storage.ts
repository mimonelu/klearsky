import Util from "@/composables/util"

export class LocalSessionStorage implements ISessionStorage {
  private readonly STORAGE_KEY = "atp"

  loadSessions (): Record<string, TTSession> {
    try {
      const stored = Util.loadStorage(this.STORAGE_KEY)
      if (!stored) {
        return {}
      }
      return stored?.sessions || {}
    } catch (error) {
      console.error("Failed to load sessions from storage:", error)
      return {}
    }
  }

  saveSession (did: string, session: TTSession): void {
    try {
      const stored = Util.loadStorage(this.STORAGE_KEY) || {}
      const sessions = stored.sessions || {}
      sessions[did] = session
      const data = { ...stored, sessions }
      Util.saveStorage(this.STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to save session to storage:", error)
    }
  }

  removeSession (did: string): void {
    try {
      const stored = Util.loadStorage(this.STORAGE_KEY) || {}
      const sessions = stored.sessions || {}
      delete sessions[did]
      const data = { ...stored, sessions }
      Util.saveStorage(this.STORAGE_KEY, data)

      // 削除したセッションが現在のセッションの場合、現在のDIDもクリア
      if (this.getCurrentDid() === did) {
        this.setCurrentDid(null)
      }
    } catch (error) {
      console.error("Failed to remove session from storage:", error)
    }
  }

  clearAllSessions (): void {
    try {
      Util.removeStorage(this.STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear sessions from storage:", error)
    }
  }

  getCurrentDid (): string | null {
    try {
      const stored = Util.loadStorage(this.STORAGE_KEY)
      return stored?.did || null
    } catch (error) {
      console.error("Failed to get current DID from storage:", error)
      return null
    }
  }

  setCurrentDid (did: string | null): void {
    try {
      const stored = Util.loadStorage(this.STORAGE_KEY) || {}
      const data = { ...stored, did }
      Util.saveStorage(this.STORAGE_KEY, data)
    } catch (error) {
      console.error("Failed to set current DID in storage:", error)
    }
  }
}
