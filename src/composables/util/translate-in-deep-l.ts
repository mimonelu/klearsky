import Util from "@/composables/util"

interface TTTranslateInDeepLParams {
  url: string
  authKey: string
  text: string
  targetLang: string
}

export default async function (params: TTTranslateInDeepLParams): Promise<Error | string> {
  try {
    const response: null | Response = await Util.fetchWithTimeout(params.url, {
      headers: {
        "Authorization": `DeepL-Auth-Key ${params.authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: params.text,
        target_lang: params.targetLang.toUpperCase(),
      }),
      method: "POST",
      mode: "no-cors",
    })
    if (response == null) {
      return Error("translationError")
    }
    const json = await response.json()
    if (json?.responseData?.translations?.[0]?.text == null) {
      return Error("translationError")
    }
    return json.responseData.translations[0].text
  } catch (_error) {
    return Error("translationError")
  }
}
