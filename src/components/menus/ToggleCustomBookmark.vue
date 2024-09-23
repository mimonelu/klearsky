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
  isCustomBookmark: ComputedRef<boolean>
}>({
  isCustomBookmark: computed((): boolean => {
    return mainState.currentCustomBookmarkPosts.some((post) => {
      return post.uri === props.uri
    })
  }),
})

async function createCustomBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("createCustomBookmark")
}

async function deleteCustomBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("deleteCustomBookmark")
}

</script>

<template>
  <button
    v-if="!state.isCustomBookmark"
    @click.stop="createCustomBookmark"
  >
    <SVGIcon name="bookmark" />
    <span>{{ $t("createCustomBookmark") }}</span>
  </button>
  <button
    v-else
    @click.stop="deleteCustomBookmark"
  >
    <SVGIcon name="bookmarkOff" />
    <span>{{ $t("deleteCustomBookmark") }}</span>
  </button>
</template>

<style lang="scss" scoped>
.toggle-custom-bookmark{
  &[data-detached="false"] {
    .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
