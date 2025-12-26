import Util from "@/composables/util"

export default async function translateText (
  text: undefined | string,
  postLanguages: undefined | ReadonlyArray<string>,
  autoTranslationIgnoreLanguage: undefined | string,
  email: undefined | string,
  forceTranslate: boolean
): Promise<undefined | Error | string> {
  if (!text) {
    return
  }
  if (!postLanguages?.length) {
    return
  }
  if (!forceTranslate) {
    if (autoTranslationIgnoreLanguage != null) {
      const ignoreLanguages = autoTranslationIgnoreLanguage
        .replace(/\s/g, "")
        .split(",")
      const ignored = ignoreLanguages.some((ignore: string) => {
        return postLanguages.includes(ignore)
      })
      if (ignored) {
        return
      }
    }
  }
  const dstLanguage = Util.getUserLanguage() ?? "en"
  if (
    postLanguages.length === 1 &&
    postLanguages[0] === dstLanguage
  ) {
    return
  }
  const langpair = postLanguages.find((srcLanguage: string) => {
    return srcLanguage !== dstLanguage
  })
  const response: Error | string = await Util.translateInMyMemory({
    text,
    langpair,
    dstLanguage,
    email,
  })
  return response
}
