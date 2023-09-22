<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerSendMention from "@/components/menu-items/SendMention.vue"
import MenuTickerSendPostAfter from "@/components/menu-items/SendPostAfter.vue"
import MenuTickerShowLikeUsers from "@/components/menu-items/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/menu-items/ShowRepostUsers.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  isUser: props.post.author.did === mainState.atp.session?.did,
  deletePostUri: props.post.author.did === mainState.atp.session?.did ? props.post.uri : undefined,
  shareText: computed((): string => {
    return `"${props.post.record.text}" - ${props.post.author.displayName}(${props.post.author.handle}) ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    const rkey = Util.getRkey(props.post.uri)
    return `https://bsky.app/profile/${props.post.author.handle}/post/${rkey}`
  }),
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

    <!-- このポストの直後に投稿する -->
    <MenuTickerSendPostAfter
      :createdAt="post.record.createdAt"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="post.record?.text"
      :langs="post.record?.langs ?? post.value?.langs"
      @close="emit('close')"
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
      :uri="post.uri"
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

    <!-- 共有する -->
    <MenuTickerWebShare
      :text="state.shareText"
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