<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menu-items/CopyTextWrapper.vue"
import MenuTickerModerateWrapper from "@/components/menu-items/ModerateWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menu-items/OpenAppWrapper.vue"
import MenuTickerOpenListUserManagementPopup from "@/components/menu-items/OpenListUserManagementPopup.vue"
import MenuTickerOpenSource from "@/components/menu-items/OpenSource.vue"
import MenuTickerTranslateText from "@/components/menu-items/TranslateText.vue"
import MenuTickerWebShare from "@/components/menu-items/WebShare.vue"
import Popover from "@/components/popovers/Popover.vue"
import ProfileFeaturesWrapper from "@/components/menu-items/ProfileFeaturesWrapper.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  isUser: boolean
  user?: TTUser
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  shareText: ComputedRef<string>
  shareUrl: ComputedRef<string>
}>({
  shareText: computed((): string => {
    return `"${props.user?.description}" - ${props.user?.displayName}(${props.user?.handle}) ${state.shareUrl}`
  }),
  shareUrl: computed((): string => {
    return `https://bsky.app/profile/${props.user?.handle}`
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
    mainState.profilePopoverSelector,
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
    class="profile-popover"
    ref="popover"
    :data-from="mainState.profilePopoverFrom"
    @close="close"
  >
    <menu
      v-if="user != null"
      class="list-menu"
    >
      <!-- メールアドレス -->
      <div
        v-if="isUser"
        class="list-menu__header"
      >{{ mainState.atp.session?.email ?? "&nbsp;" }}</div>
      <hr v-if="isUser" />

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
      <ProfileFeaturesWrapper
        :user="user"
        @close="emit('close')"
      />

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        place="profile"
        :did="user.did"
        :handle="user.handle"
        :text="user.description"
        @close="emit('close')"
      />

      <!-- モデレートする -->
      <MenuTickerModerateWrapper
        v-if="!isUser"
        :isUser="isUser"
        :user="user"
        @close="emit('close')"
      />

      <!-- 外部アプリで開く -->
      <MenuTickerOpenAppWrapper
        type="profile"
        :did="user.did"
        :handle="user.handle"
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
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.profile-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
  &[data-from="profile-view"]:deep() {
    & > .popover__content {
      padding-right: 0;
    }
  }
}
</style>
