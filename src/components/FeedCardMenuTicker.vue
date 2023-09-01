<script lang="ts" setup>
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/MenuTickerComponents/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/MenuTickerComponents/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/MenuTickerComponents/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/MenuTickerComponents/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  generator: TTFeedGenerator
  display: boolean
  container?: HTMLElement
}>()
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- リンクカードで投稿する -->
    <MenuTickerSendLinkCard
      :uri="generator.uri"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="generator.description"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :did="generator.did"
      :displayName="generator.displayName"
      :text="generator.description"
      :uri="generator.uri"
      :container="container"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      :generator="generator"
      :container="container"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenAppWrapper
      type="generator"
      :uri="generator.uri.replace('at://', '').replace('app.bsky.feed.generator', 'feed')"
      :container="container"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="generator"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
