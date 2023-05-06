<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyText from "@/components/MenuTickerComponents/CopyText.vue"
import MenuTickerOpenOtherApp from "@/components/MenuTickerComponents/OpenOtherApp.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  type: "post" | "profile";
  handle?: string;
  uri?: string;
  display: boolean;
  translateText?: string;
  copyText?: string;
  mentionTo?: string;
  deletePostUri?: string;
  openSource?: any;
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function deletePost () {
  Util.blurElement()
  if (props.deletePostUri == null) return
  emit("close")
  const result = await mainState.openConfirmationPopup($t("deletePost"), $t("deletePostMessage"))
  if (result) emit("removeThisPost", props.deletePostUri)
}
</script>

<template>
  <MenuTicker :display="display">
    <slot name="before" />

    <!-- テキストをコピーする -->
    <MenuTickerCopyText
      :text="copyText"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="translateText"
      @close="emit('close')"
    />

    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="mentionTo"
      @close="emit('close')"
    />

    <!-- ポストの削除 -->
    <button
      v-if="deletePostUri != null"
      @click.stop="deletePost"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("deletePost") }}</span>
    </button>

    <!-- 他のアプリで開く -->
    <MenuTickerOpenOtherApp
      :type="type"
      :handle="handle"
      :uri="uri"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="openSource"
      @close="emit('close')"
    />

    <slot name="after" />
  </MenuTicker>
</template>
