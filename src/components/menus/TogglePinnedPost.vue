<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

async function updatePinnedPost (uri?: string, cid?: string) {
  emit("close")
  if (mainState.centerLoaderDisplay) {
    return
  }
  mainState.centerLoaderDisplay = true
  const response = await mainState.atp.updatePinnedPost(uri, cid)
  mainState.centerLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "TogglePinnedPost/updatePinnedPost")
    return
  }
  if (mainState.userProfile == null) {
    return
  }

  // 固定ポスト作成時
  if (response) {
    mainState.userProfile.pinnedPost = {
      uri: uri as string,
      cid: cid as string,
    }
    if (mainState.currentProfile?.did === mainState.userProfile.did) {
      mainState.currentAuthorPostOfPinnedPost = props.post
    }

  // 固定ポスト削除時
  } else {
    delete mainState.userProfile.pinnedPost
    if (mainState.currentProfile?.did === mainState.userProfile.did) {
      mainState.currentAuthorPostOfPinnedPost = undefined
    }
  }
}
</script>

<template>
  <!-- 固定ポストの解除 -->
  <button
    v-if="post.uri === mainState.userProfile?.pinnedPost?.uri"
    type="button"
    @click.prevent.stop="updatePinnedPost()"
  >
    <SVGIcon name="pinOffOutline" />
    <span>{{ $t("pinnedPostOff") }}</span>
  </button>

  <!-- 固定ポストの選択（自身のポストのみ） -->
  <button
    v-else-if="post.author?.did === mainState.atp.data.did"
    type="button"
    @click.prevent.stop="updatePinnedPost(post.uri, post.cid)"
  >
    <SVGIcon name="pinOutline" />
    <span>{{ $t("pinnedPostOn") }}</span>
  </button>
</template>
