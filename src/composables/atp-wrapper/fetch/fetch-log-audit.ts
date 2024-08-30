import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | any> {
  const url = did.startsWith("did:plc:")
    // did:plc:
    ? `https://plc.directory/${did}/log/audit`

    // did:plc: 以外
    : `https://dev.uniresolver.io/1.0/identifiers/${did}`

  // TODO: 読込中も考慮すること
  let logJson: undefined | any = Util.cache.get("logAudit", url)
  if (logJson != null) return logJson
  const log = await Util.fetchWithTimeout(url)
    .then((value: any) => value)
    .catch((error: any) => error)
  if (log == null) return
  if (log instanceof Error) return
  if (!log.ok) return
  logJson = await log.json()
  console.log("[klearsky/log/audit]", logJson)

  // TODO: 配列型以外では Sandbox　で不具合が生じる可能性あり。要検証
  if (Array.isArray(logJson)) {
    logJson.reverse()
  }

  Util.cache.set("logAudit", url, logJson)
  return logJson
}
