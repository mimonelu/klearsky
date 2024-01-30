<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  list: TTList
  display: boolean
  container?: HTMLElement
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isMuted: ComputedRef<boolean>
  isBlocked: ComputedRef<boolean>
  isOwn: ComputedRef<boolean>
}>({
  isMuted: computed((): boolean => {
    return props.list.viewer?.muted ?? false
  }),
  isBlocked: computed((): boolean => {
    return props.list.viewer?.blocked != null
  }),
  isOwn: computed((): boolean => {
    return props.list.creator.did === mainState.atp.session?.did
  }),
})

function editList () {
  Util.blurElement()
  emit("close")
  emit("editList")
}

async function toggleListMute () {
  Util.blurElement()
  emit("close")

  // リストミュートの無効化
  if (state.isMuted) {
    emit("startAwait")
    const result = await mainState.atp.updateListMuteToDisable(props.list.uri)
    emit("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = false

  // リストミュートの有効化
  } else {
    emit("startAwait")
    const result = await mainState.atp.updateListMuteToEnable(props.list.uri)
    emit("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.muted = true
  }
}

async function toggleListBlock () {
  Util.blurElement()
  emit("close")

  // リストブロックの無効化
  if (state.isBlocked) {
    emit("startAwait")
    const result = await mainState.atp.updateListBlockToDisable(props.list.uri)
    emit("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    delete props.list.viewer.blocked

  // リストブロックの有効化
  } else {
    emit("startAwait")
    const result = await mainState.atp.updateListBlockToEnable(props.list.uri)
    emit("endAwait")
    if (result instanceof Error) {
      // TODO:
      return
    }
    if (props.list.viewer == null) props.list.viewer = {}
    props.list.viewer.blocked = result
  }
}

async function deleteList () {
  Util.blurElement()
  emit("close")
  const isConfirmed = await mainState.openConfirmationPopup(
    $t("listDelete"),
    $t("listDeleteMessage")
  )
  if (isConfirmed) emit("deleteList")
}
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- リスト編集ボタン -->
    <button
      v-if="state.isOwn"
      @click.prevent.stop="editList"
    >
      <SVGIcon name="edit" />
      <span>{{ $t("listEdit") }}</span>
    </button>

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

    <!-- フィードを削除する -->
    <button
      v-if="state.isOwn"
      @click.prevent.stop="deleteList"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("listDelete") }}</span>
    </button>

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :displayName="list.name"
      :text="list.description"
      :uri="list.uri"
      :container="container"
      @close="emit('close')"
    />

    <!-- 外部アプリで開く -->
    <MenuTickerOpenAppWrapper
      type="list"
      :did="list.creator.did"
      :handle="list.creator.handle"
      :uri="list.uri"
      :container="container"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="list"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
