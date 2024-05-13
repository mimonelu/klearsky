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

  subscribe (did: string, labeler: TILabeler): boolean {
    // 公式は追加不可
    if (did === CONSTS.OFFICIAL_LABELER_DID) {
      return false
    }

    // プリファレンスへ追加
    const myLabelers = this.getMyLabelerPreferences()
    if (myLabelers.every((myLabeler) => myLabeler.did !== did)) {
      myLabelers?.push({ did })
    }

    // クラスへ追加
    const labelerIndex = this.labelers.findIndex((labeler) => labeler.creator.did === did)
    if (labelerIndex === - 1) {
      this.labelers.push(labeler)
      this.updateLabelMap()
    }

    // ラベラーのHTTPヘッダーを設定
    this.setAtprotoAcceptLabelers()

    return true
  }

  unsubscribe (did: string): boolean {
    // 公式は削除不可
    if (did === CONSTS.OFFICIAL_LABELER_DID) {
      return false
    }

    // プリファレンスから削除
    const myLabelers = this.getMyLabelerPreferences()
    const myLabelerIndex = myLabelers.findIndex((myLabeler) => myLabeler.did === did)
    if (myLabelerIndex !== - 1) {
      myLabelers.splice(myLabelerIndex, 1)
    }

    // クラスから削除
    const labelerIndex = this.labelers.findIndex((labeler) => labeler.creator.did === did)
    if (labelerIndex !== - 1) {
      this.labelers.splice(labelerIndex, 1)
      this.updateLabelMap()
    }

    // 不要なラベルプリファレンスを削除
    this.cleanLabelPreferences()

    // ラベラーのHTTPヘッダーを設定
    this.setAtprotoAcceptLabelers()

    return true
  }

  isSubscribed (did?: string): boolean {
    if (did == null) {
      return false
    }
    const myLabelerDids = this.makeMyLabelerPreferenceDids()
    return myLabelerDids.indexOf(did) !== - 1
  }

  isOfficial (did?: string): boolean {
    if (did == null) {
      return false
    }
    return did === CONSTS.OFFICIAL_LABELER_DID
  }

  belowMyLabelerLimit (): boolean {
    const myLabelers = this.getMyLabelerPreferences()
    return myLabelers.length <= (CONSTS.LABELER_UPPER_LIMIT - 1)
  }

  getMyLabelerPreferences (): Array<{ did: string }> {
    const myLabelers = this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#labelersPref"
    })?.labelers ?? []

    // 公式ラベラーを追加
    if (myLabelers.every((myLabeler) => myLabeler.did !== CONSTS.OFFICIAL_LABELER_DID)) {
      myLabelers.unshift({ did: CONSTS.OFFICIAL_LABELER_DID })
    }

    return myLabelers
  }

  makeMyLabelerPreferenceDids (): string[] {
    const myLabelers = this.getMyLabelerPreferences()
    return myLabelers.map((myLabeler) => myLabeler.did) ?? []
  }

  async fetchLabeler (did: string): Promise<undefined | TILabeler> {
    const response = await this.mainState.atp.fetchLabelers([did], true)
    if (response instanceof Error) {
      this.mainState.openErrorPopup("errorApiFailed", "MyLabeler/fetchLabeler")
      return
    }
    return response[0]
  }

  async updateCurrentLabeler (did: string): Promise<boolean> {
    this.mainState.currentLabeler = await this.fetchLabeler(did)
    return this.mainState.currentLabeler != null
  }

  async updateMyLabelers (): Promise<boolean> {
    const myLabelerDids = this.makeMyLabelerPreferenceDids()
    const response = await this.mainState.atp.fetchLabelers(myLabelerDids, true)
    if (response instanceof Error) {
      this.mainState.openErrorPopup("errorApiFailed", "MyLabeler/updateMyLabelers")
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

  getLabelPreference (did: string, label: string): undefined | TTPreference {
    return this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#contentLabelPref" &&
             preference.labelerDid === did &&
             preference.label === label
    })
  }

  addLabelPreference (did: string, label: string, visibility: TTContentVisibility) {
    const existing = this.getLabelPreference(did, label)
    if (existing != null) {
      existing.visibility = visibility
    } else {
      this.mainState.currentPreferences?.push({
        $type: "app.bsky.actor.defs#contentLabelPref",
        labelerDid: did,
        label,
        visibility,
      })
    }
  }

  cleanLabelPreferences () {
    if (this.mainState.currentPreferences == null) {
      return
    }
    const results = this.mainState.currentPreferences.filter((preference) => {
      // ラベラーではない、または labelerDid がなければそのまま
      if (preference.$type !== "app.bsky.actor.defs#contentLabelPref" ||
          preference.labelerDid == null
      ) {
        return true
      }

      // labelerDid が未登録ラベラーであれば削除
      const labeler = this.labelers.find((labeler) => {
        return labeler.creator.did === preference.labelerDid
      })
      if (labeler == null) {
        return false
      }

      // visibility が既定値と同じであれば削除
      const definition = labeler.policies.labelValueDefinitions?.find((definition) => {
        return definition.identifier === preference.label
      })
      if (definition?.defaultSetting === preference.visibility) {
        return false
      }

      return true
    })
    this.mainState.currentPreferences.splice(0, this.mainState.currentPreferences.length, ...results)
  }

  setAtprotoAcceptLabelers () {
    const myLabelerDids = this.makeMyLabelerPreferenceDids()
    this.mainState.atp.agent.configureLabelersHeader(myLabelerDids)
  }
}
