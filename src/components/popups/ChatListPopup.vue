<script lang="ts" setup>
import { inject } from "vue"
import AvatarLink from "@/components/app-parts/AvatarLink.vue"
import ChatPost from "@/components/app-parts/ChatPost.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}

async function openChatMembersSelectPopup () {
  Util.blurElement()
  mainState.openChatMembersSelectPopup()
  await Util.waitProp(() => mainState.chatMembersSelectPopupProps.display, false)
  if (mainState.chatMembersSelectPopupProps.users.length === 0) {
    return
  }
  const dids = mainState.chatMembersSelectPopupProps.users.map((user) => user.did)
  mainState.loaderDisplay = true
  const myConvo = await mainState.myChat.upsertConvo(dids)
  mainState.loaderDisplay = false
  if (myConvo == null) {
    return
  }
  mainState.openChatConvoPopup(myConvo)
}

function openChatConvoPopup (myConvo: TIMyConvo) {
  Util.blurElement()
  mainState.openChatConvoPopup(myConvo)
}

function openChatConvoPopover ($event: Event, myConvo: TIMyConvo) {
  Util.blurElement()
  mainState.chatConvoPopoverProps.myConvo = myConvo
  mainState.chatConvoPopoverCallback = chatConvoPopoverCallback
  mainState.openChatConvoPopover($event.target)
}

async function chatConvoPopoverCallback (type: string) {
  mainState.loaderDisplay = true
  switch (type) {
    case "muteConvo": {
      await mainState.chatConvoPopoverProps.myConvo?.mute()
      break
    }
    case "unmuteConvo": {
      await mainState.chatConvoPopoverProps.myConvo?.unmute()
      break
    }
    case "leaveConvo": {
      await mainState.chatConvoPopoverProps.myConvo?.leave()
      break
    }
  }
  mainState.loaderDisplay = false
}

function isMine (message: TIChatMessage): boolean {
  return message.sender.did === mainState.atp.data.did
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
        class="button--plane chat-list-popup__create-convo-button"
        @click.stop="openChatMembersSelectPopup"
      >
        <SVGIcon name="chatPlus" />
      </button>
      <h2>
        <SVGIcon name="chat" />
        <span>{{ $t("chat") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="mainState.myChat.myConvos.length === 0"
        class="textlabel chat-list-popup__no-chat"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noChat") }}
        </div>
      </div>
      <template v-else>
        <div
          v-for="myConvo,myConvoIndex of mainState.myChat.myConvos"
          :key="myConvoIndex"
          class="convo-card"
          :data-has-unread-messages="myConvo.data?.unreadCount > 0"
          :data-muted="myConvo.data?.muted"
          @click="openChatConvoPopup(myConvo)"
        >
          <div
            v-if="myConvo.data?.unreadCount"
            class="convo-card__unread-count"
          >
            <SVGIcon name="chat" />
            <span>{{ myConvo.data?.unreadCount }}</span>
          </div>
          <div
            v-if="myConvo.data?.muted"
            class="convo-card__muting"
          >
            <SVGIcon name="volumeOff" />
          </div>
          <div class="convo-card__avatars">
            <template v-for="member of myConvo.data?.members">
              <AvatarLink
                v-if="member.did !== mainState.atp.data.did"
                :isLabeler="member.associated?.labeler"
                :did="member.did"
                :image="member.avatar"
                :title="member.displayName || member.handle"
                @click.stop="close"
              />
            </template>
          </div>
          <div class="convo-card__middle">
            <div class="convo-card__user-list">
              <template v-for="member of myConvo.data?.members">
                <div
                  v-if="member.did !== mainState.atp.data.did"
                  class="convo-card__user-list__item"
                >
                  <AvatarLink
                    :did="member.did"
                    :image="member.avatar"
                    :isLabeler="member.associated?.labeler"
                    :noLink="true"
                  />
                  <div class="convo-card__user-list__name">{{ member.displayName || member.handle }}</div>
                </div>
              </template>
            </div>
            <ChatPost
              v-if="myConvo.data?.lastMessage != null"
              class="convo-card__last-message"
              :myConvo="myConvo"
              :isMine="isMine(myConvo.data.lastMessage)"
            />
            <div
              v-else
              class="textlabel convo-card__no-message"
            >
              <div class="textlabel__text">
                <SVGIcon name="alert" />{{ $t("noChatMessage") }}
              </div>
            </div>
          </div>
          <div class="convo-card__right">
            <button
              class="button--plane"
              @click.stop="openChatConvoPopover($event, myConvo)"
            >
              <SVGIcon name="menu" />
            </button>
          </div>
        </div>
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.chat-list-popup {
  &:deep() {
    .popup-body {
      flex-grow: 1;
      grid-gap: 1px;
      padding: unset;
    }
  }

  &__create-convo-button {
    font-size: 1.5rem;
  }

  &__no-chat {
    padding: 1rem;
  }
}

.convo-card {
  cursor: pointer;
  display: grid;
  grid-gap: 0.5rem 0;
  grid-template-columns: auto 1fr;
  grid-template-areas: "a l r";
  align-items: flex-start;
  padding: 1rem 0 1rem 1rem;
  position: relative;
  &[data-has-unread-messages="true"] {
    background-color: var(--accent-color-0125);
  }
  &[data-muted="true"] {
    background-color: var(--fg-color-0125);
  }

  &__unread-count {
    background-color: rgb(var(--notice-color));
    border-radius:
      var(--border-radius-small)
      var(--border-radius-small)
      var(--border-radius-small)
      0;
    display: flex;
    align-items: center;
    justify-content: center;
    grid-gap: 0.25rem;
    padding: 0.125rem 0;
    position: absolute;
    left: 1rem;
    top: 0.5rem;
    z-index: 1;
    width: 3rem;
    max-width: 3rem;

    &::after {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      bottom: calc(-0.75rem + 1px);
      @include triangle("bottom", 0.5rem, 0.5rem, rgb(var(--notice-color)));
    }

    & > .svg-icon {
      fill: white;
      font-size: 0.75rem;
    }

    & > span {
      color: white;
      font-size: 0.875rem;
      font-weight: bold;
    }
  }

  &__muting {
    background-color: rgb(var(--fg-color));
    border-radius: var(--border-radius-small);
    display: flex;
    justify-content: center;
    padding: 0.25rem 0;
    pointer-events: none;
    position: absolute;
    left: 0.5rem;
    top: 2rem;
    z-index: 1;
    width: 4rem;
    max-width: 4rem;

    & > .svg-icon {
      fill: rgb(var(--bg-color), 0.75);
      font-size: 0.75rem;
    }
  }

  &__avatars {
    grid-area: a;
    display: flex;
    flex-wrap: wrap;
    grid-gap: 1px;
    margin-right: 1rem;
    max-width: 3rem;

    & > .avatar-link {
      font-size: 3rem;

      &:not(:first-child) {
        font-size: calc(1rem - 1px);
      }
    }
  }

  &__middle {
    grid-area: l;
    display: grid;
    grid-gap: 0.5rem;
  }

  &__user-list {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5em;
    font-size: 0.875rem;
    overflow: hidden;

    &__item {
      display: flex;
      align-items: center;
      grid-gap: 0.25em;
      overflow: hidden;

      & > .avatar-link {
        font-size: 1rem;
      }
    }

    &__name {
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__last-message {
    border: 1px solid var(--fg-color-0125);
    border-radius: var(--border-radius-middle);
    font-size: 0.875rem;
    overflow: hidden;
    padding: 0.5em;
  }

  &__no-message {
    opacity: 0.75;
  }

  &__right {
    grid-area: r;

    & > button {
      padding: 1em;
    }
  }
}
</style>
