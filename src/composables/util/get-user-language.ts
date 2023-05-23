import languages from "@/consts/languages.json"

export default function (): string {
  const defaultLanguage = window.navigator.language
  const languageOption: undefined | TTOption =
    languages.find((language: TTOption) => defaultLanguage === language.value)
  if (languageOption == null) return "en"
  return languageOption.value
}
