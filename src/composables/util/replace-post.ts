export default function replacePost (src: any, dst: any) {
  if (src == null || dst == null) return

  // CID オブジェクトなど特殊なオブジェクトはスキップ
  const type = Object.prototype.toString.call(src)
  if (type !== "[object Array]" && type !== "[object Object]") return

  for (const key in src) {
    if (key === "translatedText" || key === "unmask") continue
    if (dst[key] === undefined) delete src[key]
    else if (src[key] instanceof Object) replacePost(src[key], dst[key])
  }
  for (const key in dst) {
    if (key === "translatedText" || key === "unmask") continue
    if (dst[key] instanceof Object) replacePost(src[key], dst[key])
    else src[key] = dst[key]
  }
}
