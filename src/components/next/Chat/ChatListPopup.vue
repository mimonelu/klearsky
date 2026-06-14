<script lang="ts" setup>
import { computed, inject } from "vue"
import AvatarLink from "@/components/next/Avatar/AvatarLink.vue"
import ChatPost from "@/components/next/Chat/ChatPost.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"

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

function hasBlurLabel (user: TTUser): boolean {
  return hasUserBlurLabel(mainState, user.labels)
}

function acceptRequest (myConvo: TIMyConvo) {
  // chat.bsky.convo.acceptConvo
  console.log(myConvo)
}

function rejectRequest (myConvo: TIMyConvo) {
  // chat.bsky.convo.rejectConvo
  console.log(myConvo)
}

function openChatListPopover ($event: Event) {
  Util.blurElement()
  mainState.openChatListPopover($event.target)
}

function openChatConvoPopup (myConvo: TIMyConvo) {
  Util.blurElement()
  if (myConvo.data?.status === "accepted") {
    mainState.openChatConvoPopup(myConvo)
  }
}

function openChatConvoPopover ($event: Event, myConvo: TIMyConvo) {
  Util.blurElement()
  mainState.chatConvoPopoverProps.myConvo = myConvo
  mainState.chatConvoPopoverCallback = chatConvoPopoverCallback
  mainState.openChatConvoPopover($event.target)
}

async function chatConvoPopoverCallback (type: string) {
  switch (type) {
    case "unreadConvo": {
      mainState.loaderDisplay = true
      await mainState.chatConvoPopoverProps.myConvo?.updateRead()
      mainState.loaderDisplay = false
      break
    }
    case "muteConvo": {
      mainState.loaderDisplay = true
      await mainState.chatConvoPopoverProps.myConvo?.mute()
      mainState.loaderDisplay = false
      break
    }
    case "unmuteConvo": {
      mainState.loaderDisplay = true
      await mainState.chatConvoPopoverProps.myConvo?.unmute()
      mainState.loaderDisplay = false
      break
    }
    case "leaveConvo": {
      if (await mainState.openConfirmationPopup({
        title: $t("confirmation"),
        text: $t("leaveChatConvoConfirmation"),
      })) {
        mainState.loaderDisplay = true
        await mainState.chatConvoPopoverProps.myConvo?.leave()
        mainState.loaderDisplay = false
      }
      break
    }
  }
}

function isMine (message: TIChatMessage): boolean {
  return message.sender?.did === mainState.atp.data.did
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
        <div
          v-for="{ myConvo, repMember }, myConvoIndex of myConvoWithRepMember"
          :key="myConvoIndex"
          class="convo-card"
          :data-has-unread-messages="myConvo.data?.unreadCount > 0"
          :data-muted="myConvo.data?.muted"
          :data-status="myConvo.data?.status"
          @click="openChatConvoPopup(myConvo)"
        >
          <!-- 未読メッセージ数 -->
          <div
            v-if="myConvo.data?.unreadCount"
            class="convo-card__unread-count"
          >
            <SVGIcon name="chat" />
            <span>{{ myConvo.data?.unreadCount }}</span>
          </div>

          <!-- 代表アバター -->
          <div class="convo-card__avatar">
            <AvatarLink
              v-if="repMember != null"
              :key="repMember.did"
              :did="repMember.did"
              :image="repMember.avatar"
              :blur="hasBlurLabel(repMember)"
              :isLabeler="repMember.associated?.labeler"
              :actorStatus="repMember.status"
              :title="repMember.displayName || repMember.handle"
              @click.stop="close"
            />
          </div>

          <!-- ミュートアイコン -->
          <div
            v-if="myConvo.data?.muted"
            class="convo-card__muting"
          >
            <SVGIcon name="volumeOff" />
          </div>

          <div class="convo-card__middle">
            <!-- ダイレクトチャット用ヘッダー -->
            <div
              v-if="myConvo.data?.kind.$type === 'chat.bsky.convo.defs#directConvo'"
              class="convo-card__user-list"
            >
              <div
                v-if="repMember != null"
                class="convo-card__user-list__name"
                translate="no"
              >{{ repMember.displayName || repMember.handle }}</div>
            </div>

            <!-- グループチャット用ヘッダー -->
            <div
              v-else-if="myConvo.data?.kind.$type === 'chat.bsky.convo.defs#groupConvo'"
              class="convo-card__group-header"
            >
              <div class="convo-card__group-header__top">
                <div class="convo-card__group-header__item">
                  <SVGIcon name="chat" />
                  <div
                    class="convo-card__group-header__label"
                    translate="no"
                  >{{ myConvo.data?.kind.name || "&nbsp;" }}</div>
                </div>
              </div>
              <div class="convo-card__group-header__bottom">
                <div class="convo-card__group-header__item">
                  <SVGIcon name="people" />
                  <div
                    class="convo-card__group-header__label"
                    translate="no"
                  >{{ myConvo.data?.kind.memberCount ?? "-" }} / {{ myConvo.data?.kind.memberLimit ?? "-" }}</div>
                </div>
                <div
                  class="convo-card__group-header__item"
                  :data-item-type="(myConvo.data?.kind.unreadJoinRequestCount ?? 0) > 0 ? 'positive' : ''"
                >
                  <SVGIcon :name="(myConvo.data?.kind.unreadJoinRequestCount ?? 0) > 0 ? 'email' : 'emailCheck'" />
                  <div
                    class="convo-card__group-header__label"
                    translate="no"
                  >{{ myConvo.data?.kind.unreadJoinRequestCount ?? "-" }}</div>
                </div>
                <div
                  v-if="myConvo.data?.kind.lockStatus !== 'unlocked'"
                  class="convo-card__group-header__item"
                  data-item-type="important"
                >
                  <SVGIcon name="lock" />
                  <div
                    class="convo-card__group-header__label"
                    translate="no"
                  >{{ myConvo.data?.kind.lockStatus != null ? $t(`chatLockStatus-${myConvo.data?.kind.lockStatus}`) : "-" }}</div>
                </div>
              </div>
            </div>

            <!-- 受諾可否 -->
            <div
              v-if="myConvo.data?.status === 'request'"
              class="convo-card__request group-parts"
            >
              <button
                type="button"
                class="button--bordered"
                @click.stop="rejectRequest(myConvo)"
              >
                <SVGIcon name="cross" />
                <span>{{ $t("reject") }}</span>
              </button>
              <button
                type="button"
                class="button"
                @click.stop="acceptRequest(myConvo)"
              >
                <SVGIcon name="check" />
                <span>{{ $t("accept") }}</span>
              </button>
            </div>

            <!-- 最新メッセージ -->
            <ChatPost
              v-if="myConvo.data?.lastMessage != null"
              class="convo-card__last-message"
              :key="(myConvo.data as TIChatConvo).lastMessage?.id"
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
              class="button--plain"
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

.convo-card {
  display: grid;
  grid-gap: 0.5rem 0;
  grid-template-columns: auto 1fr;
  grid-template-areas: "a l r";
  align-items: flex-start;
  padding: 1rem 0 1rem 1rem;
  position: relative;
  &[data-has-unread-messages="true"] {
    background-color: rgb(var(--accent-color), 0.125);
  }
  &[data-muted="true"] {
    background-color: rgb(var(--fg-color), 0.0625);
  }
  &[data-status="accepted"] {
    cursor: pointer;
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
    background-color: rgb(0, 0, 0, 0.75);
    border-radius: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    position: absolute;
    left: 1rem;
    top: 1rem;
    width: 3rem;
    height: 3rem;

    & > .svg-icon {
      fill: white;
      font-size: 1.5rem;
    }
  }

  &__avatar {
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

    &__name {
      font-weight: bold;
      line-height: var(--line-height-low);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__group-header {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5em;
    font-size: 0.875rem;
    overflow: hidden;

    &__top,
    &__bottom {
      display: flex;
      grid-gap: 0.5em;
      overflow: hidden;
    }
    &__top {
      --alpha: 1.0;
      font-weight: bold;
    }
    &__bottom {
      --alpha: 0.5;
    }

    &__item {
      display: grid;
      align-items: center;
      grid-gap: 0.25em;
      grid-template-columns: auto 1fr;
      color: rgb(var(--fg-color), var(--alpha));
      overflow: hidden;
      &[data-item-type="positive"] {
        --alpha: 1.0;
        --fg-color: var(--green-color);
      }
      &[data-item-type="important"] {
        --alpha: 1.0;
        --fg-color: var(--notice-color);
      }

      & > .svg-icon {
        fill: rgb(var(--fg-color), var(--alpha));
      }
      & > .svg-icon--chat {
        fill: rgb(var(--post-color));
      }
    }

    &__label {
      line-height: var(--line-height-low);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__request {
    & > button {
      font-size: 0.875rem;
    }
  }

  &__last-message {
    border: 1px solid rgb(var(--fg-color), 0.125);
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
