<script lang="ts" setup>
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  list: TTList
  display: boolean
  container?: HTMLElement
}>()
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="list.description"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :displayName="list.name"
      :text="list.description"
      :uri="list.uri"
      :container="container"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="list"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
