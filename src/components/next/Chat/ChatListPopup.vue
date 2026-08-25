<script lang="ts" setup>
import { computed, inject } from "vue"
import ChatConvoCard from "@/components/next/Chat/ChatConvoCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const myConvoWithRepMember = computed(() =>
  mainState.myChat!.myConvos.map((myConvo) => {
    const members = (myConvo.data as undefined | TIChatConvo)?.members ?? []
    let repMember: undefined | TTUser
    if (myConvo.data?.kind.$type === "chat.bsky.convo.defs#directConvo") {
      repMember = members.find((m) => m.did !== mainState.atp.data.did)
    } else if (myConvo.data?.kind.$type === "chat.bsky.convo.defs#groupConvo") {
      repMember = members[0]
    }
    return { myConvo, repMember }
  })
)

function close () {
  emit("close")
}

function openChatListPopover ($event: Event) {
  Util.blurElement()
  mainState.openChatListPopover($event.target)
}
</script>

<template>
  <Popup
    class="chat-list-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <button
        type="button"
        class="button--plain"
        @click.stop="openChatListPopover"
      >
        <SVGIcon name="menu" />
      </button>
      <h2>
        <SVGIcon name="chat" />
        <span>{{ $t("chat") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="mainState.myChat!.myConvos.length === 0"
        class="textlabel chat-list-popup__no-chat"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noChat") }}
        </div>
      </div>
      <template v-else>
        <ChatConvoCard
          v-for="{ myConvo, repMember }, myConvoIndex of myConvoWithRepMember"
          :key="myConvoIndex"
          :myConvo="myConvo"
          :repMember="repMember"
          :menuDisplay="true"
          @close="close"
        />
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-list-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--post-color));
      }

      &-body {
        flex-grow: 1;
        grid-gap: 1px;
        padding: unset;
      }
    }
  }

  &__no-chat {
    padding: 1rem;
  }
}
</style>
