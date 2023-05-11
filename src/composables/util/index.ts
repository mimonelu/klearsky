import blurElement from "@/composables/util/blur-element"
import cache from "@/composables/util/cache"
import cipher from "@/composables/util/cipher"
import displayJson from "@/composables/util/display-json"
import safeJson from "@/composables/util/safe-json"
import storage from "@/composables/util/storage"
import waitProp from "@/composables/util/wait-prop"

export default {
  blurElement,
  cache,
  ...cipher,
  displayJson,
  ...safeJson,
  ...storage,
  waitProp,
}
