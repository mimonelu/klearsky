<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerSendAccountReport from "@/components/menu-items/SendAccountReport.vue"
import MenuTickerSendFeedReport from "@/components/menu-items/SendFeedReport.vue"
import MenuTickerSendListReport from "@/components/menu-items/SendListReport.vue"
import MenuTickerSendPostReport from "@/components/menu-items/SendPostReport.vue"
import MenuTickerToggleBlock from "@/components/menu-items/ToggleBlock.vue"
import MenuTickerToggleMute from "@/components/menu-items/ToggleMute.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

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
    <span>{{ $t("moderate") }}</span>

    <!-- モデレーションメニュー -->
    <MenuTicker
      class="menu-ticker__sub"
      :display="state.display"
      :container="container"
    >
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
    </MenuTicker>
  </button>
</template>
