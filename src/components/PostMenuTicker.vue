<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyText from "@/components/MenuTickerComponents/CopyText.vue"
import MenuTickerOpenOtherApp from "@/components/MenuTickerComponents/OpenOtherApp.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerShowLikeUsers from "@/components/MenuTickerComponents/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/MenuTickerComponents/ShowRepostUsers.vue"
import MenuTickerToggleBlock from "@/components/MenuTickerComponents/ToggleBlock.vue"
import MenuTickerToggleMute from "@/components/MenuTickerComponents/ToggleMute.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  author?: TTUser;
  isUser: boolean;
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
    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="mentionTo"
      @close="emit('close')"
    />

    <!-- ミュートのトグル -->
    <MenuTickerToggleMute
      v-if="!isUser"
      :user="author"
      @close="emit('close')"
    />

    <!-- ブロックのトグル -->
    <MenuTickerToggleBlock
      v-if="!isUser"
      :user="author"
      @close="emit('close')"
    />

    <!-- DID をコピーする -->
    <MenuTickerCopyText
      label="copyDid"
      :text="mainState.currentProfile?.did"
      @close="emit('close')"
    />

    <!-- ハンドルをコピーする -->
    <MenuTickerCopyText
      label="copyHandle"
      :text="mainState.currentProfile?.handle"
      @close="emit('close')"
    />

    <hr>

    <!-- テキストをコピーする -->
    <MenuTickerCopyText
      label="copyPostText"
      :text="copyText"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="translateText"
      @close="emit('close')"
    />

    <!-- ポストを削除する -->
    <button
      v-if="deletePostUri != null"
      @click.stop="deletePost"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("deletePost") }}</span>
    </button>

    <!-- リポストユーザーリストポップアップボタン -->
    <MenuTickerShowRepostUsers
      :uri="uri"
      @close="emit('close')"
    />

    <!-- ライクユーザーリストポップアップボタン -->
    <MenuTickerShowLikeUsers
      :uri="uri"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenOtherApp
      :type="'post'"
      :handle="handle"
      :uri="uri"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="openSource"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
