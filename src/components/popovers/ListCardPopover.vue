<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
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
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
