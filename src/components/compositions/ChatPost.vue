<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  myConvo: TIMyConvo
  message?: TIChatMessage
  isMine: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  post: ComputedRef<TTPost>
}>({
  // TODO:
  post: computed((): TTPost => {
    const message = props.message ?? props.myConvo.data?.lastMessage as TIChatMessage
    const author = props.myConvo.findMember(message.sender.did) ?? {
      did: "",
      displayName: "",
      handle: "",
      viewer: { muted: false },
    }
    const post = {
      __custom: { unmask: false },
      author,
      cid: "",
      indexedAt: message.sentAt,
      record: {
        $type: "app.bsky.feed.post",
        createdAt: message.sentAt,
        facets: message.facets,
        text: message.text ?? "",
      },
      embed: message.embed,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      quoteCount: 0,
      uri: "",
    }
    Util.sanitizePostsOrFeeds([post])
    return post
  }),
})

function openChatMessagePopover ($event: Event) {
  Util.blurElement()
  mainState.chatMessagePopoverProps.myConvo = props.myConvo
  mainState.chatMessagePopoverProps.message = props.message
  mainState.chatMessagePopoverCallback = chatMessagePopoverCallback
  mainState.openChatMessagePopover($event.target)
}

async function chatMessagePopoverCallback (type: string, value?: string) {
  switch (type) {
    case "deleteMessage": {
      if (props.message?.id == null) {
        return
      }
      mainState.loaderDisplay = true
      await props.myConvo.deleteMessage(props.message.id)
      mainState.loaderDisplay = false
      break
    }
    case "toggleReaction": {
      if (
        value == null ||
        props.message?.reactions == null
      ) {
        return
      }
      const reaction = props.message.reactions.find((reaction) => reaction.value === value)
      if (reaction != null) {
        await removeReaction(reaction)
      } else {
        await addReaction(value)
      }
      break
    }
  }
}

async function addReaction (value?: string) {
  if (
    value == null ||
    props.myConvo.data?.id == null ||
    props.message?.id == null ||
    props.message?.reactions == null
  ) {
    return
  }
  Util.blurElement()
  mainState.loaderDisplay = true
  const result = await mainState.atp.createChatReaction(
    props.myConvo.data.id,
    props.message.id,
    value
  )
  mainState.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "ChatPost/addReaction")
    return
  }
  Util.setArray(props.message.reactions, result.reactions)
}

async function removeReaction (reaction: TIChatReaction) {
  if (
    reaction.sender.did !== mainState.atp.data.did ||
    reaction.value == null ||
    props.myConvo.data?.id == null ||
    props.message?.id == null ||
    props.message?.reactions == null
  ) {
    return
  }
  Util.blurElement()
  mainState.loaderDisplay = true
  const result = await mainState.atp.deleteChatReaction(
    props.myConvo.data.id,
    props.message.id,
    reaction.value
  )
  mainState.loaderDisplay = false
  if (result instanceof Error) {
    return
  }
  Util.setArray(props.message.reactions, result.reactions)
}
</script>

<template>
  <Post
    class="chat-post"
    position="chatMessage"
    :post="state.post"
    :noLink="true"
    :noLabelTags="true"
    :data-is-mine="isMine"
    :data-is-last-message="message == null"
    :data-is-message-empty="!state.post.record.text"
  >
    <!-- チャットメニュー -->
    <template
      v-if="message != null"
      #header-after
    >
      <button
        class="button--plane"
        @click.stop="openChatMessagePopover"
      >
        <SVGIcon name="menu" />
      </button>
    </template>

    <!-- チャットリアクション -->
    <template
      v-if="(message?.reactions ?? []).length > 0"
      #body-after
    >
      <div class="chat-post__reactions">
        <button
          v-for="reaction, reactionIndex of message?.reactions"
          :key="reactionIndex"
          type="button"
          :title="mainState.formatDate(reaction.createdAt)"
          :disabled="reaction.sender.did !== mainState.atp.data.did"
          @click.prevent="removeReaction(reaction)"
        >{{ reaction.value }}</button>
      </div>
    </template>
  </Post>
</template>

<style lang="scss" scoped>
.chat-post {
  --chat-post-bg-color: rgb(var(--fg-color), 0.125);
  &[data-is-mine="true"] {
    --chat-post-bg-color: rgb(var(--accent-color), 0.125);
  }
  &[data-is-mine="false"] {
    --chat-post-bg-color: rgb(var(--fg-color), 0.125);
  }

  &:deep() > .body > .post__content {
    position: relative;
    width: fit-content;
  }
  &[data-is-message-empty="true"]:deep() > .body > .post__content {
    display: none;
  }

  // チャット一覧用
  &[data-is-last-message="true"] {
    background-color: var(--chat-post-bg-color);
    pointer-events: none;

    &:deep() > .body {
      & > .post__content {
        border-radius: var(--border-radius-middle);
        width: 100%;
        max-width: 100%;
        overflow: hidden;

        & > .html-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // チャットルーム用
  &[data-is-last-message="false"] {
    padding: 0 1em;

    &:deep() > .body {
      grid-gap: 0.5em;

      & > .body__header {
        grid-template-columns: auto auto auto auto;
        margin-right: -1em;

        & > .display-name {
          color: rgb(var(--fg-color), 0.5);
        }

        & > .button--plane {
          grid-area: m;
          margin: 0 0.5em 0 -0.5em;
        }
      }

      & > .post__content {
        background-color: var(--chat-post-bg-color);
        padding: 0.5em 1em;
      }

      & > .repost {
        font-size: 0.875em;
      }
    }

    // 自分のチャットメッセージ
    &[data-is-mine="true"] {
      &:deep() > .body {
        & > .body__header {
          justify-content: flex-end;
        }

        & > .post__content {
          border-radius:
            var(--border-radius-large)
            0
            var(--border-radius-large)
            var(--border-radius-large);
          margin-left: auto;
        }

        & > .label-tags {
          justify-content: flex-end;
        }
      }

      // チャットリアクション
      .chat-post__reactions {
        justify-content: flex-end;
      }
    }

    // 自分以外のチャットメッセージ
    &[data-is-mine="false"] {
      &:deep() > .body {
        & > .body__header {
          justify-content: flex-start;
        }

        & > .post__content {
          border-radius:
            0
            var(--border-radius-large)
            var(--border-radius-large)
            var(--border-radius-large);
        }
      }
    }
  }

  // チャットリアクション
  &__reactions {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.25em;
    margin-top: 0.25em;

    & > button {
      animation: reaction-animation 250ms ease-in-out;
      border: 2px solid transparent;
      border-radius: var(--border-radius-large);
      font-size: 1.25em;
      padding: 0.25em 0.25em;
      &:not(:disabled) {
        background-color: rgb(var(--accent-color), 0.25);
        cursor: pointer;
        &:hover,
        &:focus {
          border-color: rgb(var(--accent-color), 0.75);
        }
      }
    }
  }

  @keyframes reaction-animation {
    0% {
      transform: scale(1.0);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1.0);
    }
  }
}
</style>
