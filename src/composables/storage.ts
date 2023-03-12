import {
  encryptAsHash,
  encrypt,
  decrypt
} from "@/composables/cipher"

export default {
  save (key: string, json: undefined | null | any) {
    if (json == null) return
    let jsonString = null
    try {
      jsonString = JSON.stringify(json)
    } catch (error: any) {
      console.error(error)
      return
    }
    const cryptedKey = encryptAsHash(key)
    const cryptedJson = encrypt(jsonString)
    localStorage.setItem(cryptedKey, cryptedJson)
  },

  load (key: string): undefined | null | any {
    const cryptedKey = encryptAsHash(key)
    const cryptedJson: null | string = localStorage.getItem(cryptedKey)
    if (cryptedJson == null) return null
    const jsonString = decrypt(cryptedJson)
    try {
      return JSON.parse(jsonString)
    } catch (error: any) {
      console.error(error)
      return null
    }
  },

  remove (key: string) {
    const cryptedKey = encryptAsHash(key)
    localStorage.removeItem(cryptedKey)
  }
}
