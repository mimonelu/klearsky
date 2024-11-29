import Util from "@/composables/util"

interface TTTranslateInMyMemoryParams {
  text: string
  langpair?: string
  dstLanguage: string
  email?: string
}

export default async function (params: TTTranslateInMyMemoryParams): Promise<Error | string> {
  // SEE: https://mymemory.translated.net/doc/spec.php
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(params.text)}&langpair=${params.langpair}|${params.dstLanguage}&de=${encodeURIComponent(params.email ?? "")}`
  try {
    const response: Error | null | Response = await Util.fetchWithTimeout(url)
      .then((value) => value)
      .catch((error) => error)
    if (response instanceof Error || response == null) {
      return Error("translationError")
    }
    const json = await response.json()
    if (!(json?.responseData?.translatedText)) {
      return Error("translationError")
    }
    return json.responseData.translatedText
  } catch (_error) {
    return Error("translationError")
  }
}
