<script lang="ts" setup>
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyText from "@/components/MenuTickerComponents/CopyText.vue"
import MenuTickerOpenOtherApp from "@/components/MenuTickerComponents/OpenOtherApp.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  handle?: string;
  uri?: string;
  display: boolean;
  translateText?: string;
  copyText?: string;
  mentionTo?: string;
  openSource?: any;
}>()
</script>

<template>
  <MenuTicker :display="display">
    <slot name="before" />

    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="mentionTo"
      @close="emit('close')"
    />

    <!-- テキストをコピーする -->
    <MenuTickerCopyText
      :text="copyText"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="translateText"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenOtherApp
      type="profile"
      :handle="handle"
      :uri="uri"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="openSource"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
