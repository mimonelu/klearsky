import CONSTS from "@/consts/consts.json"

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
    // Prefferences へ追加
    if (this.indexOfMyLabelerPrefferences(did) === - 1) {
      const myLabelers = this.getMyLabelerPrefferences()
      myLabelers?.push({ did })
    }

    // クラスへ追加
    // TODO:
  }

  unsubscribe (did: string) {
    // 公式は削除不可
    if (did === CONSTS.OFFICIAL_LABELER_DID) {
      return
    }

    // Prefferences から削除
    const myLabelerIndex = this.indexOfMyLabelerPrefferences(did)
    if (myLabelerIndex !== - 1) {
      const myLabelers = this.getMyLabelerPrefferences()
      myLabelers.splice(myLabelerIndex, 1)
    }

    // クラスから削除
    const labelerIndex = this.labelers.findIndex((labeler) => labeler.creator.did === did)
    if (labelerIndex !== - 1) {
      this.labelers.splice(labelerIndex, 1)
      this.updateLabelMap()
    }
  }

  indexOfMyLabelerPrefferences (did: string): number {
    const myLabelerDids = this.makeMyLabelerPrefferenceDids()
    return myLabelerDids.indexOf(did)
  }

  getMyLabelerPrefferences (): Array<{ did: string }> {
    const myLabelers = this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#labelersPref"
    })?.labelers ?? []

    // 公式ラベラーを追加
    if (!myLabelers.some((myLabeler) => myLabeler.did === CONSTS.OFFICIAL_LABELER_DID)) {
      myLabelers.unshift({ did: CONSTS.OFFICIAL_LABELER_DID })
    }

    return myLabelers
  }

  makeMyLabelerPrefferenceDids (): string[] {
    const myLabelers = this.getMyLabelerPrefferences()
    const dids = myLabelers.map((myLabeler) => myLabeler.did) ?? []
    return dids
  }

  async fetchMyLabelers (): Promise<boolean> {
    const myLabelerDids = this.makeMyLabelerPrefferenceDids()
    const response = await this.mainState.atp.fetchLabelers(myLabelerDids, true)
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
      labeler.policies.labelValueDefinitions?.forEach((definition) => {
        const locale = this.getProperLocale(definition.locales)
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

  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale {
    return locales.find((locale) => {
      return locale.lang === this.mainState.$getCurrentLanguage?.()
    }) ?? locales[0]
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
    const myLabelerDids = this.makeMyLabelerPrefferenceDids()
    this.mainState.atp.agent.configureLabelersHeader(myLabelerDids)
  }
}
