import { encrypt, decrypt } from "@/composables/cipher"
import SafeJSON from "@/composables/safe-json"

export default {
  save(key: string, json: null | any) {
    if (json == null) return
    const jsonString: null | string = SafeJSON.stringify(json)
    if (jsonString == null) return
    const cryptedJson = encrypt(jsonString)
    localStorage.setItem(key, cryptedJson)
  },

  load(key: string): null | any {
    const cryptedJson: null | string = localStorage.getItem(key)
    if (cryptedJson == null) return null
    const jsonString = decrypt(cryptedJson)
    return SafeJSON.parse(jsonString)
  },

  remove(key: string) {
    localStorage.removeItem(key)
  },
}
