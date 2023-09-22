<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyText from "@/components/menu-items/CopyText.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  uri?: string
  did?: string
  displayName?: string
  handle?: string
  text?: string
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
    <span>{{ $t("copy") }}</span>

    <!-- 他のアプリで開くメニュー -->
    <MenuTicker
      :display="state.display"
      :container="container"
      class="menu-ticker__sub"
    >
      <!-- URI をコピーする -->
      <MenuTickerCopyText
        v-if="uri != null"
        label="copyUri"
        :text="uri"
        @close="emit('close')"
      />

      <!-- DID をコピーする -->
      <MenuTickerCopyText
        v-if="did != null"
        label="copyDid"
        :text="did"
        @close="emit('close')"
      />

      <!-- 表示名をコピーする -->
      <MenuTickerCopyText
        v-if="displayName != null"
        label="copyDisplayName"
        :text="displayName"
        @close="emit('close')"
      />

      <!-- ハンドルをコピーする -->
      <MenuTickerCopyText
        v-if="handle != null"
        label="copyHandle"
        :text="handle"
        @close="emit('close')"
      />

      <!-- テキストをコピーする -->
      <MenuTickerCopyText
        v-if="text != null"
        label="copyPostText"
        :text="text"
        @close="emit('close')"
      />
    </MenuTicker>
  </button>
</template>