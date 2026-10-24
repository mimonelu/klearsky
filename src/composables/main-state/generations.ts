import Util from "@/composables/util"

export default {
  // プロフィールの世代番号
  // `resetProfileState()` でのみ進めること
  profile: Util.createGeneration(),
}
