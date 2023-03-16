import { encryptAsHash, encrypt, decrypt } from "@/composables/cipher"
import SafeJSON from "@/composables/safe-json"

export default {
  save(key: string, json: null | any) {
    if (json == null) return
    const jsonString: null | string = SafeJSON.stringify(json)
    if (jsonString == null) return
    const cryptedKey = encryptAsHash(key)
    const cryptedJson = encrypt(jsonString)
    localStorage.setItem(cryptedKey, cryptedJson)
  },

  load(key: string): null | any {
    const cryptedKey = encryptAsHash(key)
    const cryptedJson: null | string = localStorage.getItem(cryptedKey)
    if (cryptedJson == null) return null
    const jsonString = decrypt(cryptedJson)
    return SafeJSON.parse(jsonString)
  },

  remove(key: string) {
    const cryptedKey = encryptAsHash(key)
    localStorage.removeItem(cryptedKey)
  },
}
