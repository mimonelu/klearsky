import Util from "@/composables/util"

export default function (this: TIAtpWrapper) {
  this.data.did = ""
  Util.saveStorage("atp", this.data)
  this.session = undefined
}
