<script lang="ts" setup>
import { inject, reactive } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerAutoTranslateText from "@/components/MenuTickerComponents/AutoTranslateText.vue"
import MenuTickerCopyTextWrapper from "@/components/MenuTickerComponents/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/MenuTickerComponents/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/MenuTickerComponents/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerShowLikeUsers from "@/components/MenuTickerComponents/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/MenuTickerComponents/ShowRepostUsers.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  post: TTPost;
  display: boolean;
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isUser: boolean
  deletePostUri?: string
}>({
  isUser: props.post.author.did === mainState.atp.session?.did,
  deletePostUri: props.post.author.did === mainState.atp.session?.did ? props.post.uri : undefined
})

async function deletePost () {
  Util.blurElement()
  if (state.deletePostUri == null) return
  emit("close")
  const result = await mainState.openConfirmationPopup($t("deletePost"), $t("deletePostMessage"))
  if (result) emit("removeThisPost", state.deletePostUri)
}
</script>

<template>
  <MenuTicker :display="display">
    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="post.author.handle"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="post.record?.text"
      @close="emit('close')"
    />

    <!-- テキストを自動翻訳する -->
    <MenuTickerAutoTranslateText
      :text="post.record?.text"
      @close="emit('autoTranslate')"
    />

    <!-- ポストを削除する -->
    <button
      v-if="state.deletePostUri != null"
      @click.stop="deletePost"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("deletePost") }}</span>
    </button>

    <!-- リポストユーザーリストポップアップボタン -->
    <MenuTickerShowRepostUsers
      :uri="post.uri"
      @close="emit('close')"
    />

    <!-- ライクユーザーリストポップアップボタン -->
    <MenuTickerShowLikeUsers
      :uri="post.uri"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :did="post.author.did"
      :handle="post.author.handle"
      :text="post.record?.text"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      v-if="!state.isUser"
      :isUser="state.isUser"
      :user="post.author"
      :post="post"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenAppWrapper
      :type="'post'"
      :did="post.author.did"
      :handle="post.author.handle"
      :uri="post.uri"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="post"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
