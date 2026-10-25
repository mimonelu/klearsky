import fetchWithTimeout from "@/composables/util/fetch-with-timeout"
import CONSTS from "@/consts/consts.json"

// Bluesky 公式のステータスページから JSON を取得する
// 応答の形は保証されないため、`Util.sanitizeServiceStatus` で整えてから使う
export default async function (path: "summary.json" | "v2/components.json"): Promise<unknown> {
  const response: unknown =
    await fetchWithTimeout(`${CONSTS.SERVICE_STATUS_URL}/${path}`, { cache: "no-store" })
      .then((value) => {
        if (!value.ok) {
          return Error("fetchServiceStatusError")
        }
        return value.json()
      })
      .catch((error) => error)
  $log("fetchServiceStatus", path, response)
  return response
}
