<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menus/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menus/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menus/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/menus/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/menus/TranslateText.vue"
import MenuTickerWebShare from "@/components/menus/WebShare.vue"
import Popover from "@/components/popovers/Popover.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  generator?: TTFeedGenerator
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  shareText: computed((): string => {
    return `${props.generator?.displayName} - ${props.generator?.description} ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    const rkey = Util.getRkey(props.generator?.uri)
    return `https://bsky.app/profile/${props.generator?.creator.did}/feed/${rkey}`
  }),
})

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.feedCardPopoverSelector,
    {
      positionX: "right",
      positionY: "bottom",
      directionX: "left",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}
</script>

<template>
  <Popover
    class="feed-card-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="generator != null"
      class="list-menu"
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
        place="feed"
        :did="generator.did"
        :displayName="generator.displayName"
        :text="generator.description"
        :uri="generator.uri"
        @close="emit('close')"
      />

      <!-- モデレートする -->
      <MenuTickerModerateWrapper
        :generator="generator"
        @close="emit('close')"
      />

      <!-- 外部アプリで開く -->
      <MenuTickerOpenAppWrapper
        type="generator"
        :uri="generator.uri.replace('at://', '').replace('app.bsky.feed.generator', 'feed')"
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
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.feed-card-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
