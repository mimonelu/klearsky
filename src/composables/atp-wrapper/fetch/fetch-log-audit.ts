import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | any> {
  const url = `https://plc.directory/${did}/log/audit`
  let logJson: undefined | any = Util.cache.get("logAudit", url)
  if (logJson != null) return logJson
  const log = await fetch(url)
  logJson = await log.json()
  console.log("[klearsky/log/audit]", logJson)
  if (!Array.isArray(logJson)) return
  logJson.reverse()
  Util.cache.set("logAudit", url, logJson)
  return logJson
}
