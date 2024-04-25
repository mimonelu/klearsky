<script lang="ts" setup>
import { nextTick, reactive, ref } from "vue"
import MenuTickerOpenTimeFeedsPopup from "@/components/menu-items/OpenTimeFeedsPopup.vue"
import MenuTickerSendMention from "@/components/menu-items/SendMention.vue"
import MenuTickerSendPostAfter from "@/components/menu-items/SendPostAfter.vue"
import MenuTickerShowLikeUsers from "@/components/menu-items/ShowLikeUsers.vue"
import MenuTickerShowRepostUsers from "@/components/menu-items/ShowRepostUsers.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  post: TTPost
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
    <span>{{ $t("postFeatures") }}</span>

    <!-- ポスト機能メニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- メンションを送る -->
        <MenuTickerSendMention
          :mentionTo="post.author.handle"
          @close="emit('close')"
        />

        <!-- リポストユーザーリストポップアップトリガー -->
        <MenuTickerShowRepostUsers
          :uri="post.uri"
          @close="emit('close')"
        />

        <!-- ライクユーザーリストポップアップトリガー -->
        <MenuTickerShowLikeUsers
          :uri="post.uri"
          @close="emit('close')"
        />

        <!-- タイムフィードで見る -->
        <MenuTickerOpenTimeFeedsPopup
          :post="post"
          @close="emit('close')"
        />

        <!-- このポストの直後に投稿する -->
        <MenuTickerSendPostAfter
          :createdAt="post.record.createdAt"
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
