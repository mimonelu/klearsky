<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyText from "@/components/MenuTickerComponents/CopyText.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  uri?: string;
  did?: string;
  handle?: string;
  text?: string;
}>()

const state = reactive<{
  display: boolean;
}>({
  display: false,
})
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.prevent.stop
    @mouseenter="state.display = true"
    @mouseleave="state.display = false"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("copy") }}</span>

    <!-- 他のアプリで開くメニュー -->
    <MenuTicker
      :display="state.display"
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
        label="copyDid"
        :text="did"
        @close="emit('close')"
      />

      <!-- ハンドルをコピーする -->
      <MenuTickerCopyText
        label="copyHandle"
        :text="handle"
        @close="emit('close')"
      />

      <!-- テキストをコピーする -->
      <MenuTickerCopyText
        label="copyPostText"
        :text="text"
        @close="emit('close')"
      />
    </MenuTicker>
  </button>
</template>
