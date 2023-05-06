<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyText from "@/components/MenuTickerComponents/CopyText.vue"
import MenuTickerOpenOtherApp from "@/components/MenuTickerComponents/OpenOtherApp.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerToggleBlock from "@/components/MenuTickerComponents/ToggleBlock.vue"
import MenuTickerToggleMute from "@/components/MenuTickerComponents/ToggleMute.vue"
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

    <!-- ミュートのトグル -->
    <MenuTickerToggleMute
      v-if="!isUser"
      :user="mainState.currentProfile ?? undefined"
      @close="emit('close')"
    />

    <!-- ブロックのトグル -->
    <MenuTickerToggleBlock
      v-if="!isUser"
      :user="mainState.currentProfile ?? undefined"
      @close="emit('close')"
    />

    <!-- DID をコピーする -->
    <MenuTickerCopyText
      label="copyDid"
      :text="mainState.currentProfile?.did"
      @close="emit('close')"
    />

    <!-- ハンドルをコピーする -->
    <MenuTickerCopyText
      label="copyHandle"
      :text="mainState.currentProfile?.handle"
      @close="emit('close')"
    />

    <!-- テキストをコピーする -->
    <MenuTickerCopyText
      label="copyPostText"
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
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="openSource"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
