<script lang="ts" setup>
import { nextTick, reactive, ref } from "vue"
import MenuTickerDownloadPostedImages from "@/components/menus/DownloadPostedImages.vue"
import MenuTickerFirstPost from "@/components/menus/FirstPost.vue"
import MenuTickerSearchAccountPost from "@/components/menus/SearchAccountPost.vue"
import MenuTickerSendMention from "@/components/menus/SendMention.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  user: TTUser
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
    <span>{{ $t("postFeatures") }}</span>

    <!-- プロフィール機能メニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- メンションを送る -->
        <MenuTickerSendMention
          :mentionTo="user.handle"
          @close="emit('close')"
        />

        <hr />

        <!-- このユーザーのポストを検索 -->
        <MenuTickerSearchAccountPost
          :user="user"
          @close="emit('close')"
        />

        <!-- 最初のポストを見る -->
        <MenuTickerFirstPost
          :did="user.did"
          @close="emit('close')"
        />

        <hr />

        <!-- 投稿画像をダウンロード -->
        <MenuTickerDownloadPostedImages
          :user="user"
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
