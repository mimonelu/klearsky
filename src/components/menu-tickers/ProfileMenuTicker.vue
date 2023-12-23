<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenListUserManagementPopup from "@/components/menu-items/OpenListUserManagementPopup.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerProfileFeaturesWrapper from "@/components/menu-items/ProfileFeaturesWrapper.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  isUser: boolean
  display: boolean
  user: TTUser
  container?: HTMLElement
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  shareText: computed((): string => {
    return `"${props.user.description}" - ${props.user.displayName}(${props.user.handle}) ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    return `https://bsky.app/profile/${props.user.handle}`
  }),
})
</script>

<template>
  <MenuTicker
    :display="display"
    :container="container"
  >
    <!-- メールアドレス -->
    <div
      v-if="isUser"
      class="list-menu__header"
    >{{ mainState.atp.session?.email ?? "&nbsp;" }}</div>

    <!-- テキストを翻訳する -->
    <MenuTickerTranslateText
      :text="user.description"
      @close="emit('close')"
    />

    <!-- リストに追加する -->
    <MenuTickerOpenListUserManagementPopup
      :user="user"
      @close="emit('close')"
    />

    <!-- プロフィール機能メニュー -->
    <MenuTickerProfileFeaturesWrapper
      :user="user"
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

    <!-- 外部アプリで開く -->
    <MenuTickerOpenAppWrapper
      type="profile"
      :did="user.did"
      :handle="user.handle"
      :container="container"
      @close="emit('close')"
    />

    <!-- 共有する -->
    <MenuTickerWebShare
      :text="state.shareText"
      :title="user.displayName"
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
