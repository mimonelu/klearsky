<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  uri: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  isPostBookmark: ComputedRef<boolean>
}>({
  isPostBookmark: computed((): boolean => {
    return mainState.currentPostBookmarkPosts.some((post) => {
      return post.uri === props.uri
    })
  }),
})

async function createPostBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("createPostBookmark")
}

async function deletePostBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("deletePostBookmark")
}

</script>

<template>
  <button
    v-if="!state.isPostBookmark"
    @click.stop="createPostBookmark"
  >
    <SVGIcon name="bookmark" />
    <span>{{ $t("createPostBookmark") }}</span>
  </button>
  <button
    v-else
    @click.stop="deletePostBookmark"
  >
    <SVGIcon name="bookmarkOff" />
    <span>{{ $t("deletePostBookmark") }}</span>
  </button>
</template>

<style lang="scss" scoped>
.toggle-post-bookmark{
  &[data-detached="false"] {
    .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
