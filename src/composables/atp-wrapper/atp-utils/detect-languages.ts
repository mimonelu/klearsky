import { detectAll } from "@/../node_modules/tinyld/dist/tinyld.light.node.js" // TODO: 適切なパスで記述すること
import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default function (data: Array<any>) {
  AtpUtil.traverseJson(data, (key: string, value: any, parent: any) => {
    if ((key === "record" || key === "value") && value.text != null)
      detectLanguages(parent)
  })
}

function detectLanguages (post: TTPost) {
  if (post.__languages != null) return
  const text = post.record?.text ?? post.value?.text
  if (text == null) {
    post.__languages = []
    return
  }
  const languages = detectAll(text)
  if (!languages) {
    post.__languages = []
    return
  }
  post.__languages = languages
}
