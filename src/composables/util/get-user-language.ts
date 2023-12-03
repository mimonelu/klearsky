import LANGUAGES from "@/consts/languages"

export default function (): string {
  const defaultLanguage = window.navigator.language
  const languageOption: undefined | TTOption = LANGUAGES
    .find((language: TTOption) => defaultLanguage === language.value)
  if (languageOption == null) return "en"
  return languageOption.value
}
