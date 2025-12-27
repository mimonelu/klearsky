<script lang="ts" setup>
import { computed, inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { useEditPost } from "@/components/next/EditPost/useEditPost"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const mainState = inject("state") as MainState

const { canEditPost } = useEditPost(props.post, mainState.atp.session?.did)

const display = computed((): boolean => canEditPost())

function onActivate () {
  // ポスト編集が許可されている状態かチェック
  if (!canEditPost()) {
    mainState.openErrorPopup("Post editing is not allowed.", "OpenEditPostPopup/onActivate")
    emit("close")
    return
  }

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
