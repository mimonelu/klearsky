<script lang="ts" setup>
import { computed, inject, nextTick, reactive, ref, type ComputedRef } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  display: boolean,
  allowIncoming: ComputedRef<TTAllowIncoming>
}>({
  display: false,
  allowIncoming: computed((): TTAllowIncoming => {
    return mainState.userProfile?.associated?.chat?.allowIncoming ?? "following"
  }),
})

const popover = ref(null)

const trigger = ref(null)

async function open () {
  state.display = true
  await nextTick()
  if (trigger.value == null || popover.value == null) {
    return
  }
  (popover.value as typeof Popover).open(
    trigger.value,
    {
      positionX: "right",
      positionY: "middle",
      directionX: "right",
      directionY: "middle",
      collideX: true,
      collideY: true,
      animationDirection: "right",
      isChild: true,
    }
  )
}

function close () {
  state.display = false
}

async function callback (type: TTAllowIncoming) {
  Util.blurElement()
  close()
  mainState.loaderDisplay = true
  if (await mainState.myChat!.setDeclaration(type)) {
    if (mainState.userProfile?.associated?.chat != null) {
      mainState.userProfile.associated.chat.allowIncoming = type
    }
  }
  mainState.loaderDisplay = false
}
</script>

<template>
  <button
    class="chat-declaration-select-popover-wrapper menu-ticker__sub-trigger"
    ref="trigger"
    type="button"
    @click.prevent.stop
    @mouseenter="open"
    @mouseleave="close"
  >
    <SVGIcon :name="
      state.allowIncoming === 'all'
        ? 'people'
        : state.allowIncoming === 'following'
          ? 'personHeart'
          : 'personOff'
    " />
    <span>{{ $t("chatDeclarationSelect") }}</span>
    <SVGIcon name="cursorRight" />

    <Popover
      v-if="state.display"
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
  </button>
</template>

<style lang="scss" scoped>
.chat-declaration-select-popover-wrapper {
  &:deep() {
    .popover > .popover__content {
      padding: 0.5rem;
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
