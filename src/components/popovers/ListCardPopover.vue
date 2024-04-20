<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/menu-items/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  list?: TTList
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isMuted: ComputedRef<boolean>
  isBlocked: ComputedRef<boolean>
  isOwn: ComputedRef<boolean>
}>({
  isMuted: computed((): boolean => {
    return props.list?.viewer?.muted ?? false
  }),
  isBlocked: computed((): boolean => {
    return props.list?.viewer?.blocked != null
  }),
  isOwn: computed((): boolean => {
    return props.list?.creator.did === mainState.atp.session?.did
  }),
})

const router = useRouter()

async function toggleListMute () {
  if (props.list == null) return
  Util.blurElement()
  emit("close")

  // リストミュートの無効化
  if (state.isMuted) {
    mainState.loaderDisplay = true
    const result = await mainState.atp.updateListMuteToDisable(props.list.uri)
    mainState.loaderDisplay = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = false

  // リストミュートの有効化
  } else {
    mainState.loaderDisplay = true
    const result = await mainState.atp.updateListMuteToEnable(props.list.uri)
    mainState.loaderDisplay = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = true
  }

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

async function toggleListBlock () {
  if (props.list == null) return
  Util.blurElement()
  emit("close")

  // リストブロックの無効化
  if (state.isBlocked) {
    mainState.loaderDisplay = true
    const result = await mainState.atp.updateListBlockToDisable(props.list.uri)
    mainState.loaderDisplay = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    delete props.list.viewer.blocked

  // リストブロックの有効化
  } else {
    mainState.loaderDisplay = true
    const result = await mainState.atp.updateListBlockToEnable(props.list.uri)
    mainState.loaderDisplay = false
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.blocked = result
  }

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

async function deleteList () {
  if (props.list == null) return
  Util.blurElement()
  emit("close")

  const isConfirmed = await mainState.openConfirmationPopup(
    $t("listDelete"),
    $t("listDeleteMessage")
  )
  if (!isConfirmed) return

  mainState.loaderDisplay = true
  const result = await mainState.atp.deleteList(props.list.uri)
  mainState.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "ListCardPopover/deleteList")
    return
  }

  // マイリストから削除
  if (!mainState.myLists.remove(props.list.uri)) return

  // マイフィードから削除
  if (mainState.myFeeds.removeItem(props.list.uri)) {
    mainState.sortFeedPreferencesSavedAndPinned()
    mainState.myFeeds.saveCustomItemSettings()
    await updatePreferences()
  }

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)

  // 削除したマイリストのリストフィード／ユーザーページにいる場合、リスト作成ユーザーのリスト一覧ページへ強制遷移
  if (props.list.creator.did === mainState.atp.session?.did &&
      (
        mainState.currentPath === "/home/list-feeds" ||
        mainState.currentPath === "/home/list-users"
      ) &&
      mainState.currentQuery.list === props.list.uri) {
    await router.push({ name: 'profile-list', query: { account: props.list.creator.did } })
  }
}

async function updatePreferences () {
  mainState.loaderDisplay = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  if (!result) mainState.openErrorPopup("errorApiFailed", "ListCardPopover/updatePreferences")
  mainState.loaderDisplay = false

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
    mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
  }
}

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.listCardPopoverSelector,
    {
      positionX: "left",
      positionY: "middle",
      directionX: "left",
      directionY: "middle",
      collideX: true,
      collideY: true,
      hornDirection: "right",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}
</script>

<template>
  <Popover
    class="list-card-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="list != null"
      class="list-menu"
    >
      <!-- リンクカードで投稿する -->
      <MenuTickerSendLinkCard
        :uri="list.uri"
        @close="emit('close')"
      />

      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="list.description"
        @close="emit('close')"
      />

      <!-- リストミュートのトグル -->
      <button @click.prevent.stop="toggleListMute">
        <SVGIcon :name="state.isMuted ? 'volumeOn' : 'volumeOff'" />
        <span>{{ $t(state.isMuted ? "muteOff" : "muteOn") }}</span>
      </button>

      <!-- リストブロックのトグル -->
      <button @click.prevent.stop="toggleListBlock">
        <SVGIcon :name="state.isBlocked ? 'person' : 'personOff'" />
        <span>{{ $t(state.isBlocked ? "unblock" : "block") }}</span>
      </button>

      <!-- リストを削除する -->
      <button
        v-if="state.isOwn"
        @click.prevent.stop="deleteList"
      >
        <SVGIcon name="remove" />
        <span>{{ $t("listDelete") }}</span>
      </button>

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        place="list"
        :displayName="list.name"
        :text="list.description"
        :uri="list.uri"
        :handle="list.creator.handle"
        @close="emit('close')"
      />

      <!-- モデレートする -->
      <MenuTickerModerateWrapper
        v-if="!state.isOwn"
        :list="list"
        @close="emit('close')"
      />

      <!-- 外部アプリで開く -->
      <MenuTickerOpenAppWrapper
        type="list"
        :did="list.creator.did"
        :handle="list.creator.handle"
        :uri="list.uri"
        @close="emit('close')"
      />

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="list"
        @close="emit('close')"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.list-card-popover {
  &:deep() {
    .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
