<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
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

const isOwn = props.list.creator.did === mainState.atp.session?.did

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
    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="list.description"
      @close="emit('close')"
    />

    <!-- フィードを削除する -->
    <button
      v-if="isOwn"
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

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="list"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
