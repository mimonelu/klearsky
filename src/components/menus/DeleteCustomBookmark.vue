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
    return mainState.currentCustomBookmarkPacks.some((pack) => {
      return pack.bookmark.uri === props.uri
    })
  }),
})

async function deleteCustomBookmark () {
  Util.blurElement()
  emit("close")
  mainState.postPopoverCallback?.("deleteCustomBookmark")
}
</script>

<template>
  <button
    v-if="state.isCustomBookmark"
    @click.stop="deleteCustomBookmark"
  >
    <SVGIcon name="bookmarkOff" />
    <span>{{ $t("deleteCustomBookmark") }}</span>
  </button>
</template>
