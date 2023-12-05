<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerOpenThreadgatePopup from "@/components/menu-items/OpenThreadgatePopup.vue"
import MenuTickerPostFeaturesWrapper from "@/components/menu-items/PostFeaturesWrapper.vue"
import MenuTickerShowLikeUsers from "@/components/menu-items/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/menu-items/ShowRepostUsers.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  post: TTPost
  display: boolean
  container?: HTMLElement
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
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="post.record?.text"
      :langs="post.record?.langs ?? post.value?.langs"
      @close="emit('close')"
    />

    <!-- Threadgate ポップアップトリガー -->
    <MenuTickerOpenThreadgatePopup
      v-if="state.isUser"
      :post="post"
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

    <!-- リポストユーザーリストポップアップトリガー -->
    <MenuTickerShowRepostUsers
      :uri="post.uri"
      @close="emit('close')"
    />

    <!-- ライクユーザーリストポップアップトリガー -->
    <MenuTickerShowLikeUsers
      :uri="post.uri"
      @close="emit('close')"
    />

    <!-- ポスト機能 -->
    <MenuTickerPostFeaturesWrapper
      :post="post"
      :container="container"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :uri="post.uri"
      :did="post.author.did"
      :handle="post.author.handle"
      :text="post.record?.text"
      :container="container"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      v-if="!state.isUser"
      :isUser="state.isUser"
      :user="post.author"
      :post="post"
      :container="container"
      @close="emit('close')"
    />

    <!-- 外部アプリで開く -->
    <MenuTickerOpenAppWrapper
      :type="'post'"
      :did="post.author.did"
      :handle="post.author.handle"
      :uri="post.uri"
      :container="container"
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
