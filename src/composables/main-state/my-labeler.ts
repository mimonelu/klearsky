export default class MyLabeler {
  public mainState: MainState

  public labelers: Array<TILabeler>

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.labelers = []
  }

  subscribe (did: string) {
    if (this.indexOfMyLabelerPrefferences(did) !== - 1) {
      return
    }

    // Prefferences へ追加
    const labelers = this.getMyLabelerPrefferences()
    labelers?.push({ did })
  }

  unsubscribe (did: string) {
    const index = this.indexOfMyLabelerPrefferences(did)
    if (index === - 1) {
      return
    }

    // Prefferences から削除
    const labelers = this.getMyLabelerPrefferences()
    labelers.splice(index, 1)
  }

  indexOfMyLabelerPrefferences (did: string): number {
    const labelerDids = this.getMyLabelerPrefferenceDids()
    return labelerDids.indexOf(did)
  }

  getMyLabelerPrefferences (): Array<{ did: string }> {
    return this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#labelersPref"
    })?.labelers ?? []
  }

  getMyLabelerPrefferenceDids (): string[] {
    const labelers = this.getMyLabelerPrefferences()
    return labelers.map((labeler) => {
      return labeler.did
    }) ?? []
  }

  async fetchMyLabelers (): Promise<boolean> {
    const labelerDids = this.getMyLabelerPrefferenceDids()
    const response = await this.mainState.atp.fetchLabelers(labelerDids, true)
    if (response instanceof Error) {
      this.mainState.openErrorPopup("errorApiFailed", "MyLabeler/fetchMyLabelers")
      return false
    }
    this.labelers.splice(0, this.labelers.length, ...response)
    return true
  }

  setAtprotoAcceptLabelers () {
    const labelerDids = this.getMyLabelerPrefferenceDids()
    this.mainState.atp.agent.configureLabelersHeader(labelerDids)
  }
}
