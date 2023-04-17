import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default function (feeds: Array<any>) {
  AtpUtil.traverseJson(feeds, (key: string, value: any, parent: any) => {
    if (key !== "text") return
    value = (value + "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    parent.__textHtml = AtpUtil.text2html(value, parent.facets/*, parent.entities */)
  })
}
