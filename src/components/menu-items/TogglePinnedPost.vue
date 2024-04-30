<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

async function updatePinnedPost (uri?: string) {
  emit("close")
  if (mainState.centerLoaderDisplay) {
    return
  }
  mainState.centerLoaderDisplay = true
  const pinned = await mainState.atp.updatePinnedPost(uri)
  mainState.centerLoaderDisplay = false
  if (pinned instanceof Error) {
    mainState.openErrorPopup(
      pinned.message,
      "TogglePinnedPost/updatePinnedPost"
    )
    return
  }
  if (mainState.userProfile == null) {
    return
  }

  // 固定ポスト作成時
  if (pinned) {
    mainState.userProfile.pinnedPost = uri
    if (mainState.currentProfile?.did === mainState.userProfile.did) {
      mainState.currentAuthorPinnedPost = props.post
    }

  // 固定ポスト削除時
  } else {
    delete mainState.userProfile.pinnedPost
    if (mainState.currentProfile?.did === mainState.userProfile.did) {
      mainState.currentAuthorPinnedPost = undefined
    }
  }
}
</script>

<template>
  <!-- 固定ポストの解除 -->
  <button
    v-if="mainState.userProfile?.pinnedPost === post.uri"
    type="button"
    @click.prevent.stop="updatePinnedPost()"
  >
    <SVGIcon name="pinOffOutline" />
    <span>{{ $t("pinnedPostOff") }}</span>
  </button>

  <!-- 固定ポストの選択 -->
  <button
    v-else
    type="button"
    @click.prevent.stop="updatePinnedPost(post.uri)"
  >
    <SVGIcon name="pinOutline" />
    <span>{{ $t("pinnedPostOn") }}</span>
  </button>
</template>
