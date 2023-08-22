<script lang="ts" setup>
import { inject } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/MenuTickerComponents/CopyTextWrapper.vue"
import MenuTickerFirstPost from "@/components/MenuTickerComponents/FirstPost.vue"
import MenuTickerModerateWrapper from "@/components/MenuTickerComponents/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/MenuTickerComponents/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/MenuTickerComponents/OpenSource.vue"
import MenuTickerSendMention from "@/components/MenuTickerComponents/SendMention.vue"
import MenuTickerTranslateText from "@/components/MenuTickerComponents/TranslateText.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  isUser: boolean
  display: boolean
  user: TTUser
  container?: HTMLElement
}>()

const mainState = inject("state") as MainState
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- メールアドレス -->
    <div
      v-if="isUser"
      class="menu-ticker__header"
    >{{ mainState.atp.session?.email ?? "&nbsp;" }}</div>

    <!-- 最初のポスト -->
    <MenuTickerFirstPost
      :did="user.did"
      @close="emit('close')"
    />

    <!-- メンションを送る -->
    <MenuTickerSendMention
      :mentionTo="user.handle"
      @close="emit('close')"
    />

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="user.description"
      @close="emit('close')"
    />

    <!-- コピーする -->
    <MenuTickerCopyTextWrapper
      :did="user.did"
      :handle="user.handle"
      :text="user.description"
      :container="container"
      @close="emit('close')"
    />

    <!-- モデレートする -->
    <MenuTickerModerateWrapper
      v-if="!isUser"
      :isUser="isUser"
      :user="user"
      :container="container"
      @close="emit('close')"
    />

    <!-- 他のアプリで開く -->
    <MenuTickerOpenAppWrapper
      type="profile"
      :did="user.did"
      :handle="user.handle"
      :container="container"
      @close="emit('close')"
    />

    <hr />

    <!-- ソースを表示する -->
    <MenuTickerOpenSource
      :source="user"
      @close="emit('close')"
    />
  </MenuTicker>
</template>
