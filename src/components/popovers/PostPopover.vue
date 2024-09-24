<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menus/CopyTextWrapper.vue"
import MenuTickerDeleteCustomBookmark from "@/components/menus/DeleteCustomBookmark.vue"
import MenuTickerModerateWrapper from "@/components/menus/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menus/OpenAppWrapper.vue"
import MenuTickerOpenChatConvoPopup from "@/components/menus/OpenChatConvoPopup.vue"
import MenuTickerOpenCustomBookmarkManagementPopup from "@/components/menus/OpenCustomBookmarkManagementPopup.vue"
import MenuTickerOpenListUserManagementPopup from "@/components/menus/OpenListUserManagementPopup.vue"
import MenuTickerOpenReactionControlPopup from "@/components/menus/OpenReactionControlPopup.vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import MenuTickerPostFeaturesWrapper from "@/components/menus/PostFeaturesWrapper.vue"
import MenuTickerToggleQuoteAttachment from "@/components/menus/ToggleQuoteAttachment.vue"
import MenuTickerTranslateText from "@/components/menus/TranslateText.vue"
import MenuTickerWebShare from "@/components/menus/WebShare.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  post?: TTPost
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isUser: boolean
  deletePostUri?: string
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  isUser: props.post?.author.did === mainState.atp.session?.did,
  deletePostUri: props.post?.author.did === mainState.atp.session?.did
    ? props.post?.uri
    : undefined,
  shareText: computed((): string => {
    return `"${props.post?.record?.text}" - ${props.post?.author.displayName}(${props.post?.author.handle}) ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    const rkey = Util.getRkey(props.post?.uri)
    return `https://bsky.app/profile/${props.post?.author.handle}/post/${rkey}`
  }),
})

async function deletePost () {
  Util.blurElement()
  if (state.deletePostUri == null) return
  emit("close")
  const result = await mainState.openConfirmationPopup({
    title: $t("deletePost"),
    text: $t("deletePostMessage"),
    post: props.post,
  })
  if (result) callback("deletePost")
}

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.postPopoverSelector,
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

function callback (type: "deletePost" | "updatePost" | "createCustomBookmark" | "deleteCustomBookmark") {
  Util.blurElement()
  close()
  if (mainState.postPopoverCallback != null) {
    mainState.postPopoverCallback(type)
  }
}
</script>

<template>
  <Popover
    class="post-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="post != null"
      class="list-menu"
    >
      <!-- プロフィール -->
      <RouterLink
        :to="{ name: 'profile-feeds', query: { account: post.author.did } }"
        @click="emit('close')"
      >
        <!-- プロフィール - 相互フォロー -->
        <SVGIcon
          v-if="post.author?.viewer?.followedBy && post.author?.viewer?.following"
          name="like"
          class="list-menu__no-color-icon"
        />

        <!-- プロフィール - フォロー中 -->
        <SVGIcon
          v-else-if="post.author?.viewer?.followedBy"
          name="likeHalf"
          data-reverse-h="true"
        />

        <!-- プロフィール - 被フォロー中 -->
        <SVGIcon
          v-else-if="post.author?.viewer?.following"
          name="likeHalf"
        />

        <!-- プロフィール - 非相互フォロー -->
        <SVGIcon
          v-else
          name="likeOutline"
        />

        <span>{{ $t("profile") }}</span>
      </RouterLink>

      <hr />

      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="post.record?.text"
        :langs="post.record?.langs ?? post.value?.langs"
        @close="emit('close')"
      />

      <!-- リストで管理する -->
      <MenuTickerOpenListUserManagementPopup
        :user="post.author"
        @close="emit('close')"
      />

      <!-- チャットを開始する -->
      <MenuTickerOpenChatConvoPopup
        :user="post.author"
        @close="emit('close')"
      />

      <!-- カスタムブックマークを管理 -->
      <MenuTickerOpenCustomBookmarkManagementPopup
        :post="post"
        @close="emit('close')"
      />

      <!-- カスタムブックマークを削除 -->
      <MenuTickerDeleteCustomBookmark
        :uri="post.uri"
        @close="emit('close')"
      />

      <!-- 引用の切断と接続 -->
      <MenuTickerToggleQuoteAttachment
        v-if="post.embed?.record?.uri?.startsWith(`at://${mainState.atp.session?.did}/`)"
        :quotedUri="post.embed.record.uri"
        :quoterUri="post.uri"
        :detached="post.embed.record.detached ?? false"
        @close="emit('close')"
      />

      <!-- 反応制御ポップアップトリガー -->
      <MenuTickerOpenReactionControlPopup
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

      <!-- ポスト機能 -->
      <MenuTickerPostFeaturesWrapper
        :post="post"
        @close="emit('close')"
      />

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        place="post"
        :uri="post.uri"
        :did="post.author.did"
        :displayName="post.author.displayName"
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

      <!-- 外部アプリで開く -->
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
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.post-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
