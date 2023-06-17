import blurElement from "@/composables/util/blur-element"
import cache from "@/composables/util/cache"
import cipher from "@/composables/util/cipher"
import displayJson from "@/composables/util/display-json"
import getRkey from "@/composables/util/get-rkey"
import getUserLanguage from "@/composables/util/get-user-language"
import parseOgp from "@/composables/util/parse-ogp"
import replacePost from "@/composables/util/replace-post"
import safeJson from "@/composables/util/safe-json"
import storage from "@/composables/util/storage"
import wait from "@/composables/util/wait"
import waitProp from "@/composables/util/wait-prop"

export default {
  blurElement,
  cache,
  ...cipher,
  displayJson,
  getRkey,
  getUserLanguage,
  parseOgp,
  replacePost,
  ...safeJson,
  ...storage,
  wait,
  waitProp,
}
