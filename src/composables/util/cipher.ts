import CryptoJS from "crypto-js"

const key = "way_to_reach_there_is_hard"

function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, key).toString()
}

function decrypt(encryptedText: string): string {
  return CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8)
}

function encryptMD5(text: string): string {
  return CryptoJS.MD5(text).toString()
}

export default {
  encrypt,
  decrypt,
  encryptMD5,
}
