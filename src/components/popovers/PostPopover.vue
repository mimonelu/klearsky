<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenListUserManagementPopup from "@/components/menu-items/OpenListUserManagementPopup.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerOpenThreadgatePopup from "@/components/menu-items/OpenThreadgatePopup.vue"
import MenuTickerPostFeaturesWrapper from "@/components/menu-items/PostFeaturesWrapper.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
    return `"${props.post?.record.text}" - ${props.post?.author.displayName}(${props.post?.author.handle}) ${state.shareUrl}`
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
  const result = await mainState.openConfirmationPopup($t("deletePost"), $t("deletePostMessage"))
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
      positionX: "left",
      positionY: "middle",
      directionX: "left",
      directionY: "middle",
      collideX: true,
      collideY: true,
      hornDirection: "right",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}

function callback (type: "deletePost" | "updatePost") {
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
      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="post.record?.text"
        :langs="post.record?.langs ?? post.value?.langs"
        @close="emit('close')"
      />

      <!-- リストに追加する -->
      <MenuTickerOpenListUserManagementPopup
        :user="post.author"
        @close="emit('close')"
      />

      <!-- Threadgate ポップアップトリガー -->
      <MenuTickerOpenThreadgatePopup
        v-if="state.isUser"
        :disabled="post.record.reply != null"
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
    .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
