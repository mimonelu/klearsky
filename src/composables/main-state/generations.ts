import Util from "@/composables/util"

export default {
  // 遷移の世代番号
  // 遷移時（ `beforeEach` ）でのみ進めること
  // `processPage()` が `listLoaderDisplay` を戻してよいかの判定に使う
  navigation: Util.createGeneration(),

  // プロフィールの世代番号
  // `resetProfileState()` でのみ進めること
  profile: Util.createGeneration(),

  // ポストスレッドの世代番号
  // 遷移時（ `beforeEach` ）でのみ進めること
  postThread: Util.createGeneration(),

  // リストの世代番号
  // `updateCurrentList()` でのみ進めること
  list: Util.createGeneration(),

  // スターターパックの世代番号
  // `updateCurrentStarterPack()` でのみ進めること
  starterPack: Util.createGeneration(),
}
