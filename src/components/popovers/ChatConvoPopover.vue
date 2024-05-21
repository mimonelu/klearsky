<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  myConvo?: TIMyConvo
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
    mainState.chatConvoPopoverSelector,
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

async function callback (type: "muteConvo" | "unmuteConvo" | "leaveConvo") {
  Util.blurElement()
  close()
  if (mainState.chatConvoPopoverCallback != null) {
    mainState.chatConvoPopoverCallback(type)
  }
}
</script>

<template>
  <Popover
    class="chat-convo-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="myConvo != null"
      class="list-menu"
    >
      <!-- チャットルームのミュート -->
      <button
        v-if="!myConvo?.data?.muted"
        @click.stop="callback('muteConvo')"
      >
        <SVGIcon name="volumeOff" />
        <span>{{ $t("muteChatConvo") }}</span>
      </button>

      <!-- チャットルームのミュート解除 -->
      <button
        v-else
        @click.stop="callback('unmuteConvo')"
      >
        <SVGIcon name="volumeOn" />
        <span>{{ $t("unmuteChatConvo") }}</span>
      </button>

      <!-- 退室 -->
      <button @click.stop="callback('leaveConvo')">
        <SVGIcon name="alert" />
        <span>{{ $t("leaveChatConvo") }}</span>
      </button>

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="myConvo.data"
        @close="close"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.chat-convo-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
