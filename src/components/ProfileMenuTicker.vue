<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/MenuTickerComponents/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/MenuTickerComponents/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/MenuTickerComponents/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  isUser: boolean
  handle?: string;
  display: boolean;
  translateText?: string;
  copyText?: string;
  mentionTo?: string;
  openSource?: any;
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <MenuTicker :display="display">
    <!-- メールアドレス -->
    <div
      v-if="isUser"
      class="menu-ticker__header"
    >{{ mainState.atp.session?.email ?? "&nbsp;" }}</div>

    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="mentionTo"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="translateText"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :did="mainState.currentProfile?.did"
      :handle="mainState.currentProfile?.handle"
      :text="copyText"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      v-if="!isUser"
      :isUser="isUser"
      :user="mainState.currentProfile ?? undefined"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenAppWrapper
      type="profile"
      :did="mainState.currentProfile?.did"
      :handle="handle"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="openSource"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
