<script lang="ts" setup>
import { inject } from "vue"
import AvatarLink from "@/components/app-parts/AvatarLink.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}

function makeLastPost (myConvo: TIMyConvo): TTPost {
  const message = myConvo.data?.lastMessage as TIChatMessage
  const author = myConvo.findMember(message.sender.did) ?? {
    did: "",
    displayName: "",
    handle: "",
    viewer: { muted: false },
  }
  return {
    __custom: { unmask: false },
    author,
    cid: "",
    indexedAt: message.sentAt,
    record: {
      $type: "",
      createdAt: message.sentAt,
      embed: message.embed,
      facets: message.facets,
      text: message.text,
    },
    likeCount: 0,
    replyCount: 0,
    repostCount: 0,
    uri: "",
  }
}

function openChatConvoPopup (myConvo: TIMyConvo) {
  console.log(myConvo)
}
</script>

<template>
  <Popup
    class="chat-list-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="chat" />
        <span>{{ $t("chat") }}</span>
      </h2>
    </template>
    <template #body>
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
        <div class="convo-card__avatars">
          <div
            v-for="member, memberIndex of myConvo.data?.members"
            :key="memberIndex"
            clas="convo-card__avatars__item"
          >
            <AvatarLink
              v-if="member.did !== mainState.atp.data.did"
              :isLabeler="member.associated?.labeler"
              :did="member.did"
              :image="member.avatar"
              :title="member.displayName || member.handle"
              @click.stop="close"
            />
          </div>
        </div>
        <div class="convo-card__last-message">
          <Post
            v-if="myConvo.data?.lastMessage != null"
            position="slim"
            :post="makeLastPost(myConvo)"
          />
        </div>
        <div class="convo-card__right">
          <button
            class="button--plane"
            @click.stop
          >
            <SVGIcon name="menu" />
          </button>
        </div>

        <!--
        <div class="group-buttons">
          <button
            v-if="myConvo.data?.muted"
            class="button--important"
          >
            <span>{{ $t("muting") }}</span>
          </button>
          <button
            v-else
            class="button"
          >
            <span>{{ $t("muteOn") }}</span>
          </button>
        </div>
        -->
      </div>
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
}

.convo-card {
  cursor: pointer;
  display: grid;
  grid-gap: 0.5rem 0;
  grid-template-columns: auto 1fr;
  grid-template-areas: "a l r";
  padding: 1rem 0 1rem 1rem;
  position: relative;
  &[data-has-unread-messages="true"] {
    background-color: var(--accent-color-0125);
  }
  &[data-muted="true"] {
    background-color: var(--accent-color-0125);
  }

  &__unread-count {
    background-color: rgb(var(--notice-color));
    border-radius: var(--border-radius-small);
    display: flex;
    align-items: center;
    justify-content: center;
    grid-gap: 0.25rem;
    padding: 0.125rem 0;
    position: absolute;
    top: -0.75rem;
    left: 1rem;
    width: 3rem;
    max-width: 3rem;

    &::after {
      content: "";
      display: block;
      position: absolute;
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

  &__muted {
    border-radius: var(--border-radius-small);
    color: rgb(var(--notice-color));
    display: grid;
    font-size: 0.875rem;
    font-weight: bold;
    margin-left: auto;
    padding: 0.125rem 0;
  }

  &__avatars {
    grid-area: a;
    margin-right: 1rem;

    .avatar-link {
      font-size: 3rem;
    }
  }

  &__last-message {
    grid-area: l;
    border: 1px solid var(--fg-color-0125);
    border-radius: var(--border-radius-middle);

    .post {
      padding: 0.5em;

      // TODO:
      pointer-events: none;
    }
  }

  &__right {
    grid-area: r;

    & > button {
      padding: 1em;
    }
  }

  /*
  .group-buttons {
    grid-area: b;
    justify-content: flex-end;
    font-size: 0.75rem;
  }
  */
}
</style>
