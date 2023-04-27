import AES from "crypto-js/aes.js"
import enc from "crypto-js/enc-utf8.js"
import MD5 from "crypto-js/md5.js"

const key = "way_to_reach_there_is_hard"

function encrypt(text: string): string {
  return AES.encrypt(text, key).toString()
}

function decrypt(encryptedText: string): string {
  return AES.decrypt(encryptedText, key).toString(enc)
}

function encryptMD5(text: string): string {
  return MD5(text).toString()
}

export default {
  encrypt,
  decrypt,
  encryptMD5,
}
