import Util from "@/composables/atp-wrapper/util"

export default function (feeds: Array<any>) {
  Util.traverseJson(feeds, (key: string, value: any, parent: any) => {
    if (key !== "text") return
    value = (value + "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    parent.__textHtml = Util.text2html(value)
  })
}
