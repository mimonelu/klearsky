// Bluesky 公式のステータスページの応答を、想定どおりの形に整える
// 応答の形式はドキュメントの例でしか確認できていないため、どのような JSON でも例外を起こさないようにする
// 型が合わない値は捨てる（文字列以外の文字列項目は `undefined`、オブジェクト以外の配列要素は除外）

function asObject (value: unknown): undefined | Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function asObjects (value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map(asObject)
    .filter((item): item is Record<string, unknown> => item != null)
}

function asString (value: unknown): undefined | string {
  return typeof value === "string" ? value : undefined
}

export default {
  // ステータスが取れない場合は `undefined` を返す
  summary (value: unknown): undefined | TTServiceStatusSummary {
    const page = asObject(asObject(value)?.page)
    const status = asString(page?.status)
    if (status == null) {
      return
    }
    return {
      page: {
        name: asString(page?.name),
        url: asString(page?.url),
        status: status as TTServiceStatusPageStatus,
      },
      activeIncidents: asObjects(asObject(value)?.activeIncidents).map((incident) => {
        return {
          name: asString(incident.name),
          started: asString(incident.started),
          status: asString(incident.status),
          impact: asString(incident.impact) as undefined | TTServiceStatusComponentStatus,
          url: asString(incident.url),
        }
      }),
      activeMaintenances: asObjects(asObject(value)?.activeMaintenances).map((maintenance) => {
        return {
          name: asString(maintenance.name),
          start: asString(maintenance.start),
          status: asString(maintenance.status),
          duration: asString(maintenance.duration),
          url: asString(maintenance.url),
        }
      }),
    }
  },

  components (value: unknown): Array<TTServiceStatusComponent> {
    return asObjects(asObject(value)?.components).map((component) => {
      const group = asObject(component.group)
      return {
        id: asString(component.id),
        name: asString(component.name),
        description: asString(component.description),
        status: asString(component.status) as undefined | TTServiceStatusComponentStatus,
        group: group != null
          ? {
            id: asString(group.id),
            name: asString(group.name),
            description: asString(group.description),
          }
          : null,
      }
    })
  },
}
