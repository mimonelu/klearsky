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

  findMyLabelerLabel (did: string, val: string): undefined | TILabelerLabel {
    let result: undefined | TILabelerLabel
    this.labelers.some((labeler) => {
      if (labeler.creator.did !== did) {
        return false
      }
      const definition = labeler.policies.labelValueDefinitions.find((definition) => {
        return definition.identifier === val
      })
      if (definition == null) {
        return false
      }
      const locale = definition.locales.find((locale) => {
        return locale.lang === this.mainState.$getCurrentLanguage?.()
      }) ?? definition.locales[0]
      if (locale == null) {
        return false
      }
      result = {
        id: `${did}-${definition.identifier}`,
        description: locale.description,
        did: labeler.creator.did,
        name: locale.name,
      }
      return true
    })
    return result
  }

  makeMyLabelerLabels (labels: Array<TTLabel>): Array<TILabelerLabel> {
    return labels.map((label) => {
      // TILabelerLabel (My Label) に該当ラベルがなければ TTLabel で代用
      return this.findMyLabelerLabel(label.src, label.val) ?? {
        id: label.uri,
        description: undefined,
        did: label.src,
        name: label.val,
      }
    })
  }

  setAtprotoAcceptLabelers () {
    const labelerDids = this.getMyLabelerPrefferenceDids()
    this.mainState.atp.agent.configureLabelersHeader(labelerDids)
  }
}
