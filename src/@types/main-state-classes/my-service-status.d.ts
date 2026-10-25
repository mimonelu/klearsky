interface TIMyServiceStatus {
  mainState: MainState
  summary?: TTServiceStatusSummary
  components: Array<TTServiceStatusComponent>
  fetchedAt?: Date
  error: boolean
  seenIncidentKeys: Array<string>
  readonly interval: number
  readonly hasIssue: boolean
  readonly indicatorDisplay: boolean
  readonly severe: boolean
  readonly messageDisplay: boolean
  getIncidentKeys (): Array<string>
  markIncidentsAsSeen (): void
  updateTimer (): void
  clearTimer (): void
  onVisibilityChange (): void
  reset (): void
  update (): Promise<void>
}
