<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import MenuTickerCopyTextWrapper from "@/components/menus/CopyTextWrapper.vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import MenuTickerTranslateText from "@/components/menus/TranslateText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import Consts from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  display: boolean
  message?: TIChatMessage
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
    mainState.chatMessagePopoverSelector,
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

async function callback (type: "deleteMessage") {
  Util.blurElement()
  close()
  if (mainState.chatMessagePopoverCallback != null) {
    mainState.chatMessagePopoverCallback(type)
  }
}

function toggleReaction (reaction: string) {
  Util.blurElement()
  close()
  if (mainState.chatMessagePopoverCallback != null) {
    mainState.chatMessagePopoverCallback("toggleReaction", reaction)
  }
}
</script>

<template>
  <Popover
    class="chat-message-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="message != null"
      class="list-menu"
    >
      <!-- 固定チャットリアクション -->
      <div
        v-for="reactions, reactionsIndex of Consts.DEFAULT_CHAT_REACTIONS"
        :key="reactionsIndex"
        class="chat-message-popover__reactions"
      >
        <button
          v-for="reaction, reactionIndex of reactions"
          :key="reactionIndex"
          class="button--plain"
          :disabled="message.reactions?.some((r) => {
            return r.value === reaction && r.sender.did !== mainState.atp.data.did
          })"
          :data-is-existing="message.reactions?.some((r) => {
            return r.value === reaction
          })"
          @click.prevent="toggleReaction(reaction)"
        >
          <span>{{ reaction }}</span>
        </button>
      </div>

      <hr />

      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="message.text"
        @close="emit('close')"
      />

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        :did="message.sender.did"
        :text="message.text"
        @close="emit('close')"
      />

      <!-- 削除 -->
      <button @click.stop="callback('deleteMessage')">
        <SVGIcon name="remove" />
        <span>{{ $t("deleteChatMessage") }}</span>
      </button>

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="message"
        @close="close"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.chat-message-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem;
    }
  }

  // 固定チャットリアクション
  &__reactions {
    display: flex;
    justify-content: center;
    grid-gap: 0.25rem;
    margin-bottom: 0.125rem;
    padding: 0 0.25rem;

    & > button {
      padding: 0.25em;
      &[data-is-existing="true"]:not(:disabled) {
        background-color: rgb(var(--accent-color), 0.25);
      }

      & > span {
        font-size: 1.25rem;
        line-height: var(--line-height-low);
      }
    }
  }
}
</style>
