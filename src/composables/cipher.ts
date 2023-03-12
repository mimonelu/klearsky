import CryptoJS from "crypto-js"

const key = "way_to_reach_there_is_hard"

export function encryptAsHash (text: string): string {
  return CryptoJS.SHA256(text).toString()
}

export function encrypt (text: string): string {
  return CryptoJS.AES.encrypt(text, key).toString()
}

export function decrypt (encryptedText: string): string {
  return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8)
}
