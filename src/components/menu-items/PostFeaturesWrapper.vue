<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerOpenTimeFeedsPopup from "@/components/menu-items/OpenTimeFeedsPopup.vue"
import MenuTickerSendMention from "@/components/menu-items/SendMention.vue"
import MenuTickerSendPostAfter from "@/components/menu-items/SendPostAfter.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  post: TTPost
  container?: HTMLElement
}>()

const state = reactive<{
  display: boolean
}>({
  display: false,
})

function showSubMenuTicker () {
  setTimeout(() => { state.display = true }, 1)
}
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.prevent.stop
    @mouseenter="showSubMenuTicker"
    @mouseleave="state.display = false"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("postFeatures") }}</span>

    <!-- ポスト機能メニュー -->
    <MenuTicker
      :display="state.display"
      :container="container"
      class="menu-ticker__sub"
    >
      <!-- メンションを送る -->
      <MenuTickerSendMention
        :mentionTo="post.author.handle"
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
    </MenuTicker>
  </button>
</template>
