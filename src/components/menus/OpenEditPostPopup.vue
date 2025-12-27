<script lang="ts" setup>
import { computed, inject } from "vue"
import { differenceInMinutes } from "date-fns"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

const display = computed((): boolean => {
  // 自分のポストでなければ編集不可
  if (props.post.author.did !== mainState.atp.session?.did) {
    return false
  }

  // 投稿から指定時間以内のみ編集可能
  const createdAt = new Date(props.post.record.createdAt)
  const minutesPassed = differenceInMinutes(new Date(), createdAt)
  return minutesPassed <= CONSTS.EDIT_POST_TIME_LIMIT_MINUTES
})

function onActivate () {
  mainState.openEditPostPopup({ post: props.post })
  emit("close")
}
</script>

<template>
  <button
    v-if="display"
    @click.prevent.stop="onActivate"
  >
    <SVGIcon name="sendPost" />
    <span>{{ $t("editPost") }}</span>
  </button>
</template>
