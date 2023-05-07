<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/MenuTickerComponents/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/MenuTickerComponents/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/MenuTickerComponents/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerShowLikeUsers from "@/components/MenuTickerComponents/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/MenuTickerComponents/ShowRepostUsers.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  author?: TTUser;
  isUser: boolean;
  did?: string;
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

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :did="did"
      :handle="handle"
      :text="copyText"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      v-if="!isUser"
      :isUser="isUser"
      :user="author"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenAppWrapper
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
