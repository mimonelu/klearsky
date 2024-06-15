<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  viewer: TTUserViewer
  did: string
  declarationDid: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

async function toggleFollow () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    if (props.viewer.following != null) {
      await mainState.atp.deleteFollow(props.viewer.following)
      props.viewer.following = undefined
    } else {
      const uri = await mainState.atp.createFollow(props.declarationDid)
      if (uri != null) props.viewer.following = uri
    }
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <button
    class="follow-button"
    :class="viewer.following != null ? 'button' : 'button--bordered'"
    :data-is-following="viewer.following != null"
    :data-is-processing="state.processing"
    @click.prevent="toggleFollow"
  >
    <!-- どちらもフォローなし -->
    <SVGIcon
      v-if="viewer.following == null && viewer.followedBy == null"
      name="likeOutline"
    />

    <!-- 自分からのみフォロー -->
    <SVGIcon
      v-else-if="viewer.following != null && viewer.followedBy == null"
      name="likeHalf"
    />

    <!-- 相手からのみフォロー -->
    <SVGIcon
      v-else-if="viewer.following == null && viewer.followedBy != null"
      name="likeHalf"
      :reverseH="true"
    />

    <!-- 相互フォロー -->
    <SVGIcon
      v-else
      name="like"
    />

    <span>{{ $t(viewer.following != null ? "following" : "follow") }}</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.follow-button {
  --fg-color: var(--like-color);
  position: relative;
  &[data-is-processing="true"] {
    pointer-events: none;
  }

  & > .loader {
    font-size: 0.75em;
    position: absolute;
  }
}
</style>
