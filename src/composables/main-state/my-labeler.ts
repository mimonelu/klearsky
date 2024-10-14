import CONSTS from "@/consts/consts.json"
import LABEL_BEHAVIORS from "@/consts/label-behaviors.json"

export default class MyLabeler {
  public mainState: MainState

  public labelers: Array<TILabeler>

  public labelMap: { [did: string]: TILabelSetting }

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
    if (myLabelers.every((myLabeler) => myLabeler!.did !== did)) {
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
    const myLabelerIndex = myLabelers.findIndex((myLabeler) => myLabeler!.did === did)
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
    const myLabelers = (this.mainState.currentPreferences as Array<TTPreferenceLabeler>)
      ?.find((preference) => {
        return preference.$type === "app.bsky.actor.defs#labelersPref"
      })
      ?.labelers ?? []

    // 公式ラベラーを追加
    if (myLabelers.every((myLabeler) => {
      return myLabeler!.did !== CONSTS.OFFICIAL_LABELER_DID
    })) {
      myLabelers.unshift({ did: CONSTS.OFFICIAL_LABELER_DID })
    }

    return myLabelers
  }

  makeMyLabelerPreferenceDids (): string[] {
    const myLabelers = this.getMyLabelerPreferences()
    return myLabelers.map((myLabeler) => myLabeler!.did) ?? []
  }

  async fetchLabeler (did: string): Promise<undefined | TILabeler> {
    const response = await this.mainState.atp.fetchLabelers([did], true)
    if (response instanceof Error) {
      this.mainState.openErrorPopup(response, "MyLabeler/fetchLabeler")
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
      // Sandbox PDS では存在しないためコメントアウト
      // this.mainState.openErrorPopup(response, "MyLabeler/updateMyLabelers")

      return false
    }
    this.labelers.splice(0, this.labelers.length, ...response)

    // labelMap の更新も同時に行う
    this.updateLabelMap()

    return true
  }

  updateLabelMap () {
    /* // TODO:
    Object.keys(this.labelMap).forEach((key) => {
      delete this.labelMap[key]
    })
    */
    this.labelers.forEach((labeler) => {
      labeler.policies.labelValueDefinitions?.forEach((definition) => {
        const locale = this.getProperLocale(definition.locales)
        if (locale == null) {
          return
        }
        const did = labeler.creator.did
        const id = `${did}-${definition.identifier}`
        const preference = this.getLabelPreference(did, definition.identifier)

        // SEE: https://github.com/bluesky-social/social-app/blob/main/src/lib/moderation/useLabelBehaviorDescription.ts
        const isBadge =
          definition.severity === "inform" &&
          (
            definition.blurs !== "content" &&
            definition.blurs !== "media"
          )

        if (this.labelMap[id] == null) {
          this.labelMap[id] = {
            did,
            definition,
            isBadge,
            locale,
            preference,
          }
        } else {
          this.labelMap[id].did = did
          this.labelMap[id].definition = definition
          this.labelMap[id].isBadge = isBadge
          this.labelMap[id].locale = locale
          this.labelMap[id].preference = preference
        }
      })
    })

    // !hide の追加設定
    const hideId = `${CONSTS.OFFICIAL_LABELER_DID}-!hide`
    this.labelMap[hideId] = this.makeLabelSetting("!hide", "hide")

    // !warn の追加設定
    const warnId = `${CONSTS.OFFICIAL_LABELER_DID}-!warn`
    this.labelMap[warnId] = this.makeLabelSetting("!warn", "warn")
  }

  makeLabelSetting (identifier: string, defaultSetting: TTContentVisibility): TILabelSetting {
    return {
      did: CONSTS.OFFICIAL_LABELER_DID,
      definition: {
        blurs: "none",
        defaultSetting,
        identifier,
        locales: [],
        severity: "none",
      },
      isBadge: false,
      locale: {
        description: "",
        lang: "en",
        name: "",
      },
    }
  }

  getProperLocale (locales: Array<TILabelerDefinitionLocale>): undefined | TILabelerDefinitionLocale {
    return locales.find((locale) => {
      return locale.lang === this.mainState.$getCurrentLanguage?.()
    }) ?? locales[0]
  }

  getSpecificLabels (
    labels: Array<TTLabel>,
    visibility: Array<TTContentVisibility>,
    blurs: Array<TTLabelBlurs>
  ): Array<TILabelSetting> {
    return labels
      .map((label): undefined | TILabelSetting => {
        let labelSetting = this.labelMap[`${label.src}-${label.val}`]
        if (labelSetting == null) {
          // 特別な公式ラベルの処理
          if (!LABEL_BEHAVIORS[label.val]?.selectable) {
            return
          }
          labelSetting = this.labelMap[`${CONSTS.OFFICIAL_LABELER_DID}-${label.val}`]
          if (labelSetting == null) {
            return
          }
        }
        return labelSetting
      })
      .filter((labelSetting?: TILabelSetting) => {
        if (labelSetting == null) {
          return false
        }
        const dstVisibility = labelSetting.preference?.visibility ?? labelSetting.definition.defaultSetting
        const dstVisibilityModified = labelSetting.isBadge && dstVisibility === "warn" ? "show" : dstVisibility
        return visibility.includes(dstVisibilityModified) &&
               blurs.includes(labelSetting.definition.blurs)
      }) as Array<TILabelSetting>
  }

  getLabelPreference (did: string, label: string): undefined | TTPreferenceLabel {
    return this.mainState.currentPreferences?.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#contentLabelPref" &&
             preference.label === label &&
             (
               preference.labelerDid === did ||
               (
                 preference.labelerDid == null &&
                 CONSTS.OFFICIAL_SPECIAL_LABELERS.includes(label)
               )
             )
    }) as undefined | TTPreferenceLabel
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

    // 特別な公式ラベルの labelerDid を削除
    ;(results as Array<TTPreferenceLabel>).forEach((result) => {
      if (result.label != null && CONSTS.OFFICIAL_SPECIAL_LABELERS.includes(result.label)) {
        delete result.labelerDid
      }
    })

    this.mainState.currentPreferences.splice(0, this.mainState.currentPreferences.length, ...results)
  }

  async like (uri: string, cid: string): Promise<Error | string> {
    const response = await this.mainState.atp.createLike(uri, cid)
    if (response instanceof Error) {
      return response
    }
    const labeler = this.labelers.find((labeler) => {
      return labeler.uri === uri
    })
    if (labeler == null) {
      return response
    }
    if (labeler.likeCount != null) {
      labeler.likeCount ++
    }
    if (labeler.viewer == null) {
      labeler.viewer = {}
    }
    labeler.viewer.like = response
    return response
  }

  async unlike (uri: string, likeUri: string): Promise<Error | undefined> {
    const response = await this.mainState.atp.deleteLike(likeUri)
    if (response instanceof Error) {
      return response
    }
    const labeler = this.labelers.find((labeler) => {
      return labeler.uri === uri
    })
    if (labeler == null) {
      return
    }
    if (labeler.likeCount != null) {
      labeler.likeCount --
    }
    if (labeler.viewer != null) {
      delete labeler.viewer.like
    }
  }

  setAtprotoAcceptLabelers (): Error | undefined {
    if (this.mainState.atp.agent == null) {
      return Error("noAgentError")
    }
    const myLabelerDids = this.makeMyLabelerPreferenceDids()
    this.mainState.atp.agent.configureLabelers(myLabelerDids)
  }
}
