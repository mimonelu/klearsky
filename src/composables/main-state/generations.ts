import Util from "@/composables/util"

export default {
  // プロフィールの世代番号
  // `resetProfileState()` でのみ進めること
  profile: Util.createGeneration(),

  // ポストスレッドの世代番号
  // 遷移時（ `beforeEach` ）でのみ進めること
  postThread: Util.createGeneration(),
}
