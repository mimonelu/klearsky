<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerFirstPost from "@/components/menu-items/FirstPost.vue"
import MenuTickerSearchAccountPost from "@/components/menu-items/SearchAccountPost.vue"
import MenuTickerSendMention from "@/components/menu-items/SendMention.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

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

    <!-- プロフィール機能メニュー -->
    <MenuTicker
      :display="state.display"
      :container="container"
      class="menu-ticker__sub"
    >
      <!-- メンションを送る -->
      <MenuTickerSendMention
        :mentionTo="user.handle"
        @close="emit('close')"
      />

      <!-- 最初のポストを見る -->
      <MenuTickerFirstPost
        v-if="user.did.startsWith('did:plc')"
        :did="user.did"
        @close="emit('close')"
      />

      <!-- このユーザーのポストを検索 -->
      <MenuTickerSearchAccountPost
        :user="user"
        @close="emit('close')"
      />
    </MenuTicker>
  </button>
</template>
