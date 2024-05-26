<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
        text: message.text ?? "",
      },
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      uri: "",
    }
  }),
})

function openChatMessagePopover ($event: Event) {
  Util.blurElement()
  mainState.chatMessagePopoverProps.myConvo = props.myConvo
  mainState.chatMessagePopoverProps.message = props.message
  mainState.chatMessagePopoverCallback = chatMessagePopoverCallback
  mainState.openChatMessagePopover($event.target)
}

async function chatMessagePopoverCallback (type: string) {
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
  }
}
</script>

<template>
  <Post
    class="chat-post"
    position="chatMessage"
    :post="state.post"
    :noLink="true"
    :data-is-mine="isMine"
    :data-is-last-message="message == null"
    :data-is-message-empty="!state.post.record.text"
  >
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
  </Post>
</template>

<style lang="scss" scoped>
.chat-post {
  --chat-post-bg-color: var(--fg-color-0125);
  &[data-is-mine="true"] {
    --chat-post-bg-color: var(--accent-color-025);
  }
  &[data-is-mine="false"] {
    --chat-post-bg-color: var(--fg-color-0125);
  }
  &:deep(.post__content) {
    position: relative;
    width: fit-content;
  }
  &[data-is-message-empty="true"]:deep(.post__content) {
    display: none;
  }

    // チャット一覧用
  &[data-is-last-message="true"] {
    background-color: var(--chat-post-bg-color);
    pointer-events: none;

    &:deep() {
      .post__content {
        border-radius: var(--border-radius-middle);
        max-width: 100%;
      }

      .html-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // チャットルーム用
  &[data-is-last-message="false"] {
    padding: 0 1em;

    &:deep() {
      .body__right {
        grid-gap: 0;
      }

      .body__right__header {
        grid-template-columns: auto 1fr auto auto;
        margin-right: -1em;

        & > .button--plane {
          margin-left: -0.5em;
        }
      }

      .display-name {
        color: var(--fg-color-05);
      }

      .post__content {
        background-color: var(--chat-post-bg-color);
        padding: 1em;
      }
    }

    &[data-is-mine="true"]:deep(.post__content) {
      border-radius:
        var(--border-radius-large)
        0
        var(--border-radius-large)
        var(--border-radius-large);
      margin-left: auto;
    }
    &[data-is-mine="false"]:deep(.post__content) {
      border-radius:
        0
        var(--border-radius-large)
        var(--border-radius-large)
        var(--border-radius-large);
    }
  }
}
</style>
