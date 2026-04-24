<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import ChatDeclarationSelectPopoverWrapper from "@/components/next/Chat/ChatDeclarationSelectPopoverWrapper.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  (popover.value as typeof Popover).open(
    mainState.chatListPopoverSelector,
    {
      positionX: "left",
      positionY: "bottom",
      directionX: "right",
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

async function openChatMembersSelectPopup () {
  Util.blurElement()
  close()
  mainState.openChatMembersSelectPopup()
  await Util.waitProp(() => mainState.chatMembersSelectPopupProps.display, false)
  if (mainState.chatMembersSelectPopupProps.users.length === 0) {
    return
  }
  const dids = mainState.chatMembersSelectPopupProps.users.map((user) => user.did)
  mainState.loaderDisplay = true
  const myConvo = await mainState.myChat!.fetchMyConvo(dids)
  mainState.loaderDisplay = false
  if (myConvo == null) {
    return
  }
  mainState.openChatConvoPopup(myConvo)
}

async function updateChatList () {
  Util.blurElement()
  close()
  if (mainState.myChat == null) {
    return
  }
  mainState.loaderDisplay = true
  const result = await mainState.myChat.updateConvosAll()
  mainState.loaderDisplay = false
  if (!result) {
    $error("ChatListPopover", "Failed to update chat conversations")
    return
  }

  // ページタイトルの更新
  // チャット通知があれば表示するため
  mainState.updatePageTitle()
}
</script>

<template>
  <Popover
    class="chat-list-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <!-- チャットメンバーの選択 -->
      <button
        type="button"
        @click.stop="openChatMembersSelectPopup"
      >
        <SVGIcon name="chatPlus" />
        <span>{{ $t("addChatMember") }}</span>
      </button>

      <!-- チャット公開設定ポップオーバー -->
      <ChatDeclarationSelectPopoverWrapper
        @close="emit('close')"
      />

      <hr />

      <!-- チャットリスト更新ボタン -->
      <button
        type="button"
        @click.stop="updateChatList"
      >
        <SVGIcon name="refresh" />
        <span>{{ $t("refresh") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.chat-list-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem;
    }
  }

  .svg-icon--chatPlus {
    --fg-color: var(--post-color);
  }
}
</style>
