import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

// Bluesky 公式のステータスページの監視
// 定期取得は `summary.json` のみとし、`components.json` は異常時とポップアップ表示時にのみ取得する
export default class MyServiceStatus {
  public mainState: MainState

  public summary?: TTServiceStatusSummary

  public components: Array<TTServiceStatusComponent>

  public fetchedAt?: Date

  public error: boolean

  // ポップアップで確認済みのインシデント（メモリのみ）
  public seenIncidentKeys: Array<string>

  private timer?: number

  // 監視中の取得間隔。監視していない時は `0`
  private activeInterval: number

  // 最新の取得だけを反映するための世代番号。取得のたびと監視の停止時に進める
  private generation: ReturnType<typeof Util.createGeneration>

  private visibilityChangeHandler: () => void

  constructor (mainState: MainState) {
    this.mainState = mainState
    this.summary = undefined
    this.components = []
    this.fetchedAt = undefined
    this.error = false
    this.seenIncidentKeys = []
    this.timer = undefined
    this.activeInterval = 0
    this.generation = Util.createGeneration()

    // NOTICE: リアクティブなプロキシ経由で呼ぶため `mainState` から辿る
    this.visibilityChangeHandler = () => {
      mainState.myServiceStatus?.onVisibilityChange()
    }
  }

  get interval (): number {
    return this.mainState.currentSetting?.serviceStatusFetchInterval ?? 0
  }

  // 異常の有無（メンテナンス中を含む）
  get hasIssue (): boolean {
    const status = this.summary?.page?.status
    return status != null && status !== "UP"
  }

  // アイコンの表示可否。監視を停止している時は、ポップアップで取得した状態があっても表示しない
  get indicatorDisplay (): boolean {
    return this.interval !== 0 && this.hasIssue
  }

  // メッセージの表示可否
  // 影響の小さいグループ（Relay・Jetstream）以外に一部停止以上のコンポーネントがあり、未確認のインシデントがある場合
  get messageDisplay (): boolean {
    if (!this.indicatorDisplay) {
      return false
    }
    const hasOutage = this.components.some((component) => {
      if (component.status !== "PARTIALOUTAGE" && component.status !== "MAJOROUTAGE") {
        return false
      }
      const groupName = component.group?.name ?? component.name ?? ""
      return !CONSTS.SERVICE_STATUS_MINOR_GROUPS.includes(groupName)
    })
    if (!hasOutage) {
      return false
    }
    return this.getIncidentKeys().some((key) => !this.seenIncidentKeys.includes(key))
  }

  // インシデントの識別子。ドキュメントの例に `id` がないため `url` を使う
  getIncidentKeys (): Array<string> {
    const keys = (this.summary?.activeIncidents ?? [])
      .map((incident) => incident.url ?? incident.name ?? "")
    return keys.length > 0 ? keys : [""]
  }

  markIncidentsAsSeen () {
    for (const key of this.getIncidentKeys()) {
      if (!this.seenIncidentKeys.includes(key)) {
        this.seenIncidentKeys.push(key)
      }
    }
  }

  // 設定の変更のたびに呼ばれるため、取得間隔が変わっていなければ何もしない
  updateTimer () {
    if (this.interval === this.activeInterval) {
      return
    }
    this.clearTimer()
    if (this.interval === 0) {
      this.reset()
      return
    }
    this.activeInterval = this.interval
    document.addEventListener("visibilitychange", this.visibilityChangeHandler)
    if (document.visibilityState === "visible") {
      this.startInterval()
    }
  }

  clearTimer () {
    this.activeInterval = 0
    this.stopInterval()
    document.removeEventListener("visibilitychange", this.visibilityChangeHandler)
  }

  onVisibilityChange () {
    if (document.visibilityState === "visible") {
      this.startInterval()
    } else {
      this.stopInterval()
    }
  }

  // タブの表示切り替えのたびに取得しないよう、前回の取得から取得間隔が経っていなければ残り時間だけ待つ
  private startInterval () {
    this.stopInterval()
    const elapsed = this.fetchedAt != null ? Date.now() - this.fetchedAt.getTime() : Infinity
    const delay = Math.max(this.interval - elapsed, 0)
    this.timer = window.setTimeout(() => {
      this.update()
      this.timer = window.setInterval(() => {
        this.update()
      }, this.interval)
    }, delay)
  }

  // NOTICE: `clearTimeout` と `clearInterval` は同じ ID の一覧を扱うため、どちらのタイマーも止められる
  private stopInterval () {
    if (this.timer != null) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  reset () {
    this.generation.next()
    this.summary = undefined
    this.components = []
    this.fetchedAt = undefined
    this.error = false
  }

  async update (): Promise<void> {
    const generation = this.generation.next()
    const summaryResponse = await Util.fetchServiceStatus("summary.json")
    if (!this.generation.isCurrent(generation)) {
      return
    }
    const summary = summaryResponse instanceof Error
      ? undefined
      : Util.sanitizeServiceStatus.summary(summaryResponse)
    if (summary?.page?.status == null) {
      this.setError()
      return
    }

    let components: Array<TTServiceStatusComponent> = []
    if (summary.page.status !== "UP" || this.mainState.serviceStatusPopupDisplay) {
      const response = await Util.fetchServiceStatus("v2/components.json")
      if (!this.generation.isCurrent(generation)) {
        return
      }
      if (response instanceof Error) {
        this.setError()
        return
      }
      components = Util.sanitizeServiceStatus.components(response)
    }

    this.summary = summary
    this.components = components
    this.fetchedAt = new Date()
    this.error = false
  }

  // 誤報を避けるため、取得に失敗した場合は前回の状態を消す
  private setError () {
    this.summary = undefined
    this.components = []
    this.fetchedAt = new Date()
    this.error = true
  }
}
