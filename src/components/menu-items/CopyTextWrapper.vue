<script lang="ts" setup>
import { computed, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyText from "@/components/menu-items/CopyText.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  place?: "feed" | "list" | "post" | "profile"
  uri?: string
  did?: string
  displayName?: string
  handle?: string
  text?: string
  container?: HTMLElement
}>()

const state = reactive<{
  display: boolean
  officialUrl: ComputedRef<undefined | string>
}>({
  display: false,
  officialUrl: computed((): undefined | string => {
    switch (props.place) {
      case "feed": {
        const uri = props.uri?.replace('at://', '').replace('app.bsky.feed.generator', 'feed')
        return `https://bsky.app/profile/${uri}`
      }
      case "list": {
        const rkey = Util.getRkey(props.uri)
        return `https://bsky.app/profile/${props.handle}/lists/${rkey}`
      }
      case "post": {
        const rkey = Util.getRkey(props.uri)
        return `https://bsky.app/profile/${props.handle}/post/${rkey}`
      }
      case "profile": {
        return `https://bsky.app/profile/${props.handle}`
      }
    }
  }),
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

    <!-- コピーするメニュー -->
    <MenuTicker
      :display="state.display"
      :container="container"
      class="menu-ticker__sub"
    >
      <!-- 公式 URL をコピーする -->
      <MenuTickerCopyText
        v-if="place != null"
        label="copyOfficialUrl"
        :text="state.officialUrl"
        @close="emit('close')"
      />

      <!-- URI をコピーする -->
      <MenuTickerCopyText
        v-if="uri != null"
        label="copyAtUri"
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
