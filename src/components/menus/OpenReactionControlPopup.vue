<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost;
}>()

const mainState = inject("state") as MainState

function onActivate () {
  emit("close")
  if (props.post == null) {
    return
  }
  mainState.openReactionControlPopup({
    mode: "post",
    isReply: props.post.record?.reply != null,
    postThreadgate: props.post.threadgate,
    postUri: props.post.uri,
    onClosed: async (params: any) => {
      if (params?.updated) {

        // TODO: ポストポップオーバーのコールバックで更新しているが、適切な手段ではない。要検討
        if (mainState.postPopoverCallback != null) {
          // レコード更新直後に最新レコードを取得できない現象対策
          // TODO: 原因不明に付き暫定対応、後日再検証すること
          await Util.wait(375)

          mainState.postPopoverCallback("updatePost")
        }
      }
    },
  })
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="lock" />
    <span>{{ $t("reactionControl") }}</span>
  </button>
</template>
