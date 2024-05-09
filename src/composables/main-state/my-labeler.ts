export default class MyLabeler {
  public mainState: MainState

  public labelers: Array<TILabeler>

  public labelMap: { [did: string]: TILabelerLabel }

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.labelers = []
    this.labelMap = {}
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
    const labelerDids = this.makeMyLabelerPrefferenceDids()
    return labelerDids.indexOf(did)
  }

  getMyLabelerPrefferences (): Array<{ did: string }> {
    return this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#labelersPref"
    })?.labelers ?? []
  }

  makeMyLabelerPrefferenceDids (): string[] {
    const labelers = this.getMyLabelerPrefferences()
    const dids = labelers.map((labeler) => labeler.did) ?? []

    // 公式ラベラーを追加
    dids.unshift("did:plc:ar7c4by46qjdydhdevvrndac")

    return dids
  }

  async fetchMyLabelers (): Promise<boolean> {
    const labelerDids = this.makeMyLabelerPrefferenceDids()
    const response = await this.mainState.atp.fetchLabelers(labelerDids, true)
    if (response instanceof Error) {
      this.mainState.openErrorPopup("errorApiFailed", "MyLabeler/fetchMyLabelers")
      return false
    }
    this.labelers.splice(0, this.labelers.length, ...response)

    // labelMap の更新も同時に行う
    this.updateLabelMap()

    return true
  }

  updateLabelMap () {
    Object.keys(this.labelMap).forEach((key) => {
      delete this.labelMap[key]
    })
    this.labelers.forEach((labeler) => {
      labeler.policies.labelValueDefinitions.forEach((definition) => {
        const locale = definition.locales.find((locale) => {
          return locale.lang === this.mainState.$getCurrentLanguage?.()
        }) ?? definition.locales[0]
        if (locale == null) {
          return
        }
        const id = `${labeler.creator.did}-${definition.identifier}`
        this.labelMap[id] = {
          id,
          description: locale.description,
          did: labeler.creator.did,
          name: locale.name,
        }
      })
    })
  }

  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel> {
    return labels.map((label) => {
      // TILabelerLabel (My Label) に該当ラベルがなければ TTLabel で代用
      const id = `${label.src}-${label.val}`
      return this.labelMap[id] ?? {
        id: label.uri,
        description: undefined,
        did: label.src,
        name: label.val,
      }
    })
  }

  setAtprotoAcceptLabelers () {
    const labelerDids = this.makeMyLabelerPrefferenceDids()
    this.mainState.atp.agent.configureLabelersHeader(labelerDids)
  }
}
