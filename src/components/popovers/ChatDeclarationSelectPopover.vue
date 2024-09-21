<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  allowIncoming: ComputedRef<TTAllowIncoming>
}>({
  allowIncoming: computed((): TTAllowIncoming => {
    return mainState.userProfile?.associated?.chat?.allowIncoming ?? "following"
  }),
})

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
        :disabled="state.allowIncoming === 'all'"
        @click.stop="callback('all')"
      >
        <SVGIcon name="people" />
        <span>{{ $t("allow-incoming-all") }}</span>
      </button>

      <!-- フォロー中のみ -->
      <button
        :disabled="state.allowIncoming === 'following'"
        @click.stop="callback('following')"
      >
        <SVGIcon name="personHeart" />
        <span>{{ $t("allow-incoming-following") }}</span>
      </button>

      <!-- 全員不可 -->
      <button
        :disabled="state.allowIncoming === 'none'"
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

    .svg-icon--people {
      fill: rgb(var(--share-color));
    }
    .svg-icon--personHeart {
      fill: rgb(var(--like-color));
    }
    .svg-icon--personOff {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
