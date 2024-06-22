import Util from "@/composables/util"

export default function (text?: string) {
  if (!text) return
  const language = Util.getUserLanguage() ?? "en"
  window.open(`https://translate.google.com/?sl=auto&tl=${language}&text=${encodeURIComponent(text)}&op=translate`)
}
