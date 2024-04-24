<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
  post?: TTPost
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.repostPopoverSelector,
    {
      positionX: "center",
      positionY: "bottom",
      directionX: "center",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}

function callback (type: "createRepost" | "deleteRepost" | "createQuoteRepost") {
  Util.blurElement()
  close()
  if (mainState.repostPopoverCallback != null) {
    mainState.repostPopoverCallback(type)
  }
}
</script>

<template>
  <Popover
    class="repost-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="post != null"
      class="list-menu"
    >
      <!-- リポスト - 作成 -->
      <button
        v-if="post.viewer?.repost == null"
        @click.stop="callback('createRepost')"
      >
        <SVGIcon name="repost" />
        <span>{{ $t("sendRepost") }}</span>
      </button>

      <!-- リポスト - 削除 -->
      <button
        v-else
        @click.stop="callback('deleteRepost')"
      >
        <SVGIcon name="repost" />
        <span>{{ $t("deleteRepost") }}</span>
      </button>

      <!-- 引用リポスト -->
      <button @click.stop="callback('createQuoteRepost')">
        <SVGIcon name="quoteRepost" />
        <span>{{ $t("sendQuoteRepost") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.repost-popover {
  &:deep() {
    .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
