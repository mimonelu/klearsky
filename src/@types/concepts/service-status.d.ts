// Bluesky 公式のステータスページ（Instatus）の応答
// SEE: https://instatus.com/help/widgets/custom-badge
// NOTICE: ドキュメントの例と実際の応答が異なる可能性があるため、すべて省略可能にしている

type TTServiceStatusPageStatus = "UP" | "HASISSUES" | "UNDERMAINTENANCE"

type TTServiceStatusComponentStatus =
  "OPERATIONAL" |
  "UNDERMAINTENANCE" |
  "DEGRADEDPERFORMANCE" |
  "PARTIALOUTAGE" |
  "MAJOROUTAGE"

interface TTServiceStatusSummary {
  page?: {
    name?: string
    url?: string
    status?: TTServiceStatusPageStatus
  }
  activeIncidents?: Array<TTServiceStatusIncident>
  activeMaintenances?: Array<TTServiceStatusMaintenance>
}

interface TTServiceStatusIncident {
  name?: string
  started?: string
  status?: string
  impact?: TTServiceStatusComponentStatus
  url?: string
}

interface TTServiceStatusMaintenance {
  name?: string
  start?: string
  status?: string
  duration?: string
  url?: string
}

interface TTServiceStatusComponent {
  id?: string
  name?: string
  description?: string
  status?: TTServiceStatusComponentStatus
  group?: null | {
    id?: string
    name?: string
    description?: string
  }
}
