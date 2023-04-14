import blurElement from "@/composables/util/blur-element"
import cipher from "@/composables/util/cipher"
import dateLabel from "@/composables/util/date-label"
import displayJson from "@/composables/util/display-json"
import safeJson from "@/composables/util/safe-json"
import storage from "@/composables/util/storage"
import waitProp from "@/composables/util/wait-prop"

export default {
  blurElement,
  ...cipher,
  dateLabel,
  displayJson,
  ...safeJson,
  ...storage,
  waitProp,
}
