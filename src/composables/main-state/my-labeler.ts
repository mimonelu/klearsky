export default class MyLabeler {
  public mainState: MainState

  constructor (mainState: MainState) {
    this.mainState = mainState
  }

  findIndex (did: string): number {
    const labelerDids = this.getLabelerDids()
    return labelerDids.indexOf(did)
  }

  subscribe (did: string) {
    if (this.findIndex(did) !== - 1) {
      return
    }
    const labelers = this.getLabelers()
    labelers?.push({ did })
  }

  unsubscribe (did: string) {
    const index = this.findIndex(did)
    if (index === - 1) {
      return
    }
    const labelers = this.getLabelers()
    labelers.splice(index, 1)
  }

  getLabelers (): Array<{ did: string }> {
    return this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#labelersPref"
    })?.labelers ?? []
  }

  getLabelerDids (): string[] {
    const labelers = this.getLabelers()
    return labelers.map((labeler) => {
      return labeler.did
    }) ?? []
  }

  setAtprotoAcceptLabelers () {
    const labelerDids = this.getLabelerDids()
    this.mainState.atp.agent.configureLabelersHeader(labelerDids)
  }
}
