<script lang="ts" setup>
import { nextTick, reactive, ref } from "vue"
import MenuTickerSendAccountReport from "@/components/menus/SendAccountReport.vue"
import MenuTickerSendFeedReport from "@/components/menus/SendFeedReport.vue"
import MenuTickerSendListReport from "@/components/menus/SendListReport.vue"
import MenuTickerSendPostReport from "@/components/menus/SendPostReport.vue"
import MenuTickerToggleBlock from "@/components/menus/ToggleBlock.vue"
import MenuTickerToggleMute from "@/components/menus/ToggleMute.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  isUser?: boolean
  user?: TTUser
  post?: TTPost
  generator?: TTFeedGenerator
  list?: TTList
  container?: HTMLElement
}>()

const state = reactive<{
  display: boolean
}>({
  display: false,
})

const trigger = ref(null)

const popover = ref(null)

async function open () {
  state.display = true
  await nextTick()
  if (trigger.value == null || popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    trigger.value,
    {
      positionX: "left",
      positionY: "middle",
      directionX: "left",
      directionY: "middle",
      collideX: true,
      collideY: true,
      animationDirection: "left",
      isChild: true,
    }
  )
}

function close () {
  state.display = false
}
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    ref="trigger"
    @click.prevent.stop
    @mouseenter="open"
    @mouseleave="close"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("moderate") }}</span>

    <!-- モデレーションメニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- ミュートのトグル -->
        <MenuTickerToggleMute
          v-if="!isUser && generator == null && list == null"
          :user="user"
          @close="emit('close')"
        />

        <!-- ブロックのトグル -->
        <MenuTickerToggleBlock
          v-if="!isUser && generator == null && list == null"
          :user="user"
          @close="emit('close')"
        />

        <!-- アカウントレポート送信ポップアップを開く -->
        <MenuTickerSendAccountReport
          v-if="!isUser && user != null"
          :user="user"
          @close="emit('close')"
        />

        <!-- ポストレポート送信ポップアップを開く -->
        <MenuTickerSendPostReport
          v-if="!isUser && post != null"
          :post="post"
          @close="emit('close')"
        />

        <!-- フィードレポート送信ポップアップを開く -->
        <MenuTickerSendFeedReport
          v-if="generator != null"
          :generator="generator"
          @close="emit('close')"
        />

        <!-- リストレポート送信ポップアップを開く -->
        <MenuTickerSendListReport
          v-if="list != null"
          :list="list"
          @close="emit('close')"
        />
      </menu>
    </Popover>
  </button>
</template>

<style lang="scss" scoped>
.popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
