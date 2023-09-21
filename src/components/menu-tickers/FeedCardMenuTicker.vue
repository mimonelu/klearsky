<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/menu-items/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  display: boolean
  container?: HTMLElement
}>()

const state = reactive<{
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  shareText: computed((): string => {
    return `${props.generator.displayName} - ${props.generator.description} ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    const rkey = Util.getRkey(props.generator.uri)
    return `https://bsky.app/profile/${props.generator.creator.did}/feed/${rkey}`
  }),
})

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

    <!-- 共有する -->
    <MenuTickerWebShare
      :text="state.shareText"
      :title="generator.displayName"
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
