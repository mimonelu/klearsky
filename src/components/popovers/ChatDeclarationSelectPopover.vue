<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
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
    mainState.chatDeclarationSelectPopoverSelector,
    {
      positionX: "left",
      positionY: "bottom",
      directionX: "right",
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

async function callback (type: TTAllowIncoming) {
  Util.blurElement()
  close()
  if (mainState.chatDeclarationSelectPopoverCallback != null) {
    mainState.chatDeclarationSelectPopoverCallback(type)
  }
}
</script>

<template>
  <Popover
    class="chat-declaration-select-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <!-- 全員可 -->
      <button
        :disabled="mainState.currentProfile?.associated?.chat?.allowIncoming === 'all'"
        @click.stop="callback('all')"
      >
        <SVGIcon name="people" />
        <span>{{ $t("allow-incoming-all") }}</span>
      </button>

      <!-- フォロー中のみ -->
      <button
        :disabled="mainState.currentProfile?.associated?.chat?.allowIncoming === 'following'"
        @click.stop="callback('following')"
      >
        <SVGIcon name="personHeart" />
        <span>{{ $t("allow-incoming-following") }}</span>
      </button>

      <!-- 全員不可 -->
      <button
        :disabled="mainState.currentProfile?.associated?.chat?.allowIncoming === 'none'"
        @click.stop="callback('none')"
      >
        <SVGIcon name="personOff" />
        <span>{{ $t("allow-incoming-none") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.chat-declaration-select-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
