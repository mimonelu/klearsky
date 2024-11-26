<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import MenuTickerCopyTextWrapper from "@/components/menus/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menus/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menus/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/menus/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/menus/TranslateText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
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
  isMyList: ComputedRef<boolean>
}>({
  isMuted: computed((): boolean => {
    return props.list?.viewer?.muted ?? false
  }),
  isBlocked: computed((): boolean => {
    return props.list?.viewer?.blocked != null
  }),
  isMyList: computed((): boolean => {
    return props.list?.creator.did === mainState.atp.session?.did
  }),
})

const router = useRouter()

async function toggleListMute () {
  if (props.list == null || mainState.listCardPopoverCallback == null) return
  Util.blurElement()
  emit("close")

  // リストミュートの無効化
  if (state.isMuted) {
    await mainState.listCardPopoverCallback("startAwait")
    const result = await mainState.atp.updateListMuteToDisable(props.list.uri)
    await mainState.listCardPopoverCallback("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = false

  // リストミュートの有効化
  } else {
    await mainState.listCardPopoverCallback("startAwait")
    const result = await mainState.atp.updateListMuteToEnable(props.list.uri)
    await mainState.listCardPopoverCallback("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = true
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

async function toggleListBlock () {
  if (props.list == null || mainState.listCardPopoverCallback == null) return
  Util.blurElement()
  emit("close")

  // リストブロックの無効化
  if (state.isBlocked) {
    await mainState.listCardPopoverCallback("startAwait")
    const result = await mainState.atp.updateListBlockToDisable(props.list.uri)
    await mainState.listCardPopoverCallback("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    delete props.list.viewer.blocked

  // リストブロックの有効化
  } else {
    await mainState.listCardPopoverCallback("startAwait")
    const result = await mainState.atp.updateListBlockToEnable(props.list.uri)
    await mainState.listCardPopoverCallback("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.blocked = result
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

// リストの複製
async function duplicateList () {
  Util.blurElement()
  emit("close")
  if (props.list == null) {
    return
  }
  const isConfirmed = await mainState.openConfirmationPopup({
    title: $t("listDuplicate"),
    text: $t("listDuplicateMessage"),
  })
  if (!isConfirmed) {
    return
  }
  mainState.loaderDisplay = true
  const dstListUri = await mainState.atp.createDuplicatedList(props.list.uri)
  mainState.loaderDisplay = false
  if (dstListUri instanceof Error) {
    mainState.openErrorPopup(dstListUri, "ListCardPopover/duplicateList")
    return
  }
  const dstList = await mainState.atp.fetchList(dstListUri)
  if (dstList instanceof Error) {
    mainState.openErrorPopup(dstList, "ListCardPopover/duplicateList")
    return
  }
  mainState.myLists!.items.unshift(dstList)

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)

  router.push({
    path: "/home/list-users",
    query: {
      list: dstList.uri,
      displayName: dstList.name,
    },
  })
}

async function detectFollowingsInList () {
  Util.blurElement()
  emit("close")
  if (
    props.list == null ||
    mainState.myLists == null ||
    mainState.listCardPopoverCallback == null
  ) {
    return
  }
  await mainState.listCardPopoverCallback("startAwait")
  const followings = (await mainState.myLists.fetchAllListItems(props.list.uri))
    .map((item) => {
      return item.subject
    })
    .filter((user: TTUser) => {
      return (
        user.viewer?.following != null ||
        user.did === mainState.atp.data.did
      )
    })
    .sort((a: TTUser, b: TTUser) => {
      const aIsMe = a.did === mainState.atp.data.did
      const bIsMe = b.did === mainState.atp.data.did
      return aIsMe ? - 1 : (bIsMe ? 1 : 0)
    })
  await mainState.listCardPopoverCallback("endAwait")
  mainState.userListPopupProps.users = followings
  mainState.userListPopupProps.headerLabel = "listDetectFollowings"
  mainState.userListPopupProps.noUsersMessage = "listDetectFollowingsNoUsers"
  mainState.openUserListPopup()
}

async function deleteList () {
  Util.blurElement()
  emit("close")
  const isConfirmed = await mainState.openConfirmationPopup({
    title: $t("listDelete"),
    text: $t("listDeleteMessage"),
  })
  if (isConfirmed && mainState.listCardPopoverCallback != null) {
    await mainState.listCardPopoverCallback("deleteList")
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
      positionX: "right",
      positionY: "bottom",
      directionX: "left",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
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

      <!-- リストの複製 -->
      <button @click.prevent.stop="duplicateList">
        <SVGIcon name="list" />
        <span>{{ $t("listDuplicate") }}</span>
      </button>

      <!-- フォロー中ユーザーの存在判定 -->
      <button @click.prevent.stop="detectFollowingsInList">
        <SVGIcon name="people" />
        <span>{{ $t("listDetectFollowings") }}</span>
      </button>

      <!-- リストを削除する -->
      <button
        v-if="state.isMyList"
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
        :list="list"
        @close="emit('close')"
      >
        <template #before>
          <!-- リストミュートのトグル -->
          <button @click.prevent.stop="toggleListMute">
            <SVGIcon :name="state.isMuted ? 'volumeOff' : 'volumeOn'" />
            <span>{{ $t(state.isMuted ? "muteOff" : "muteOn") }}</span>
          </button>

          <!-- リストブロックのトグル -->
          <button @click.prevent.stop="toggleListBlock">
            <SVGIcon :name="state.isBlocked ? 'personOff' : 'person'" />
            <span>{{ $t(state.isBlocked ? "unblock" : "block") }}</span>
          </button>
        </template>
      </MenuTickerModerateWrapper>

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
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
