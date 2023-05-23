import Util from "@/composables/util"

export default {
  saveStorage(key: string, json: null | any) {
    if (json == null) return
    const jsonString: null | string = Util.stringify(json)
    if (jsonString == null) return
    const cryptedJson = Util.encrypt(jsonString)
    localStorage.setItem(key, cryptedJson)
  },

  loadStorage(key: string): null | any {
    const cryptedJson: null | string = localStorage.getItem(key)
    if (cryptedJson == null) return null
    const jsonString = Util.decrypt(cryptedJson)
    return Util.parse(jsonString)
  },

  removeStorage(key: string) {
    localStorage.removeItem(key)
  },
}
