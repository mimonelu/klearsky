import fetchWithTimeout from "@/composables/util/fetch-with-timeout"

// プロフィールリンク先の favicon を cardyb 経由で取得する（最大 64px の PNG）
// アップロードは保存時に行う。取得できなかった場合は `undefined` を返す
// NOTICE: blob はレコードから参照されるまで CDN で配信されないため、プレビューには data URL を使う
export default async function (url: string): Promise<undefined | {
  file: Blob
  dataUrl: string
}> {
  const response: Error | Response =
    await fetchWithTimeout(
      `https://cardyb.bsky.app/v1/favicon?url=${encodeURIComponent(url)}&fresh=true`,
      { cache: "no-store" }
    )
      .then((value) => value)
      .catch((error) => error)
  $log("fetchProfileLinkIcon", response)
  if (
    response instanceof Error ||
    !response.ok ||
    response.headers.get("content-type") !== "image/png"
  ) {
    return
  }
  const file = await response.blob().catch(() => undefined)
  if (file == null) {
    return
  }
  const dataUrl = await new Promise<undefined | string>((resolve) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      resolve(typeof fileReader.result === "string" ? fileReader.result : undefined)
    }
    fileReader.onerror = () => {
      resolve(undefined)
    }
    fileReader.readAsDataURL(file)
  })
  if (dataUrl == null) {
    return
  }
  return { file, dataUrl }
}
