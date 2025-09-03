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
  isBookmark: ComputedRef<boolean>
}>({
  isBookmark: computed((): boolean => {
    return mainState.currentBookmarkPacks.some((pack) => {
      return pack.bookmark.uri === props.uri
    })
  }),
})

async function deleteBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("deleteBookmark")
}
</script>

<template>
  <button
    v-if="state.isBookmark"
    @click.stop="deleteBookmark"
  >
    <SVGIcon name="bookmarkOff" />
    <span>{{ $t("deleteBookmark") }}</span>
  </button>
</template>
