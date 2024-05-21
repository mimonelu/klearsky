<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
  message?: TIChatMessage
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
    mainState.chatMessagePopoverSelector,
    {
      positionX: "right",
      positionY: "bottom",
      directionX: "left",
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

async function callback (type: "deleteMessage") {
  Util.blurElement()
  close()
  if (mainState.chatMessagePopoverCallback != null) {
    mainState.chatMessagePopoverCallback(type)
  }
}
</script>

<template>
  <Popover
    class="chat-message-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="message != null"
      class="list-menu"
    >
      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="message.text"
        @close="emit('close')"
      />

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        :did="message.sender.did"
        :text="message.text"
        @close="emit('close')"
      />

      <!-- 削除 -->
      <button @click.stop="callback('deleteMessage')">
        <SVGIcon name="remove" />
        <span>{{ $t("deleteChatMessage") }}</span>
      </button>

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="message"
        @close="close"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.chat-message-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
