import blurElement from "@/composables/util/blur-element"
import cache from "@/composables/util/cache"
import cipher from "@/composables/util/cipher"
import displayJson from "@/composables/util/display-json"
import getUserLanguage from "@/composables/util/get-user-language"
import parseOgp from "@/composables/util/parse-ogp"
import safeJson from "@/composables/util/safe-json"
import storage from "@/composables/util/storage"
import wait from "@/composables/util/wait"
import waitProp from "@/composables/util/wait-prop"

export default {
  blurElement,
  cache,
  ...cipher,
  displayJson,
  getUserLanguage,
  parseOgp,
  ...safeJson,
  ...storage,
  wait,
  waitProp,
}
