<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  orderButtonDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  saved: ComputedRef<boolean>
}>({
  processing: false,
  saved: computed((): boolean => {
    return mainState.feedPreferences?.saved
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
})

async function toggleSaved () {
  Util.blurElement()
  if (state.processing) return
  if (mainState.feedPreferences == null) return
  if (mainState.feedPreferences.saved == null) mainState.feedPreferences.saved = []

  // フィードブックマークの削除
  if (state.saved)
    mainState.feedPreferences.saved.splice(
      0,
      mainState.feedPreferences.saved.length,
      ...mainState.feedPreferences.saved.filter((uri: string) => uri !== props.generator.uri)
    )

  // フィードブックマークの追加
  else
    mainState.feedPreferences.saved.push(props.generator.uri)

  state.processing = true
  if (!await mainState.atp.updatePreferences(mainState.currentPreferences))
    mainState.openErrorPopup("errorApiFailed", "CustomFeedCard/updatePreferences")
  state.processing = false
}

function changeCustomFeedOrder (direction: "up" | "down") {
  const saved = mainState.feedPreferences?.saved
  if (saved == null) return
  const index = saved.findIndex((uri: string) => uri === props.generator.uri)
  if (index == null) return
  if (direction === "up" && index > 0)
    [saved[index], saved[index - 1]] = [saved[index - 1], saved[index]]
  else if (direction === "down" && index < saved.length - 1)
    [saved[index], saved[index + 1]] = [saved[index + 1], saved[index]]
  emit("changeCustomFeedOrder")
}
</script>

<template>
  <RouterLink
    class="custom-feed-card"
    :to="{ path: '/feeds', query: {
      feed: generator.uri,
      displayName: generator.displayName,
    } }"
    @click.stop
  >
    <div class="custom-feed-card__top">
      <!-- フィード画像 -->
      <img
        class="custom-feed-card__avatar"
        loading="lazy"
        :src="generator.avatar"
        alt=""
      >

      <div class="custom-feed-card__top__right">
        <!-- フィード名 -->
        <div class="custom-feed-card__display-name">
          <SVGIcon name="rss" />
          <span>{{ generator.displayName }}</span>
        </div>

        <!-- フィードライク数 -->
        <div class="custom-feed-card__like-count">
          <SVGIcon name="heart" />
          <span>{{ generator.likeCount }}</span>
        </div>

        <!-- フィード作成日時 -->
        <div class="custom-feed-card__indexed-at">
          <SVGIcon name="clock" />
          <span>{{ mainState.formatDate(generator.indexedAt) }}</span>
        </div>

        <div class="custom-feed-card__top__right__right">
          <!-- お気に入りフィード -->
          <button
            class="custom-feed-card__bookmark"
            :data-saved="state.saved"
            @click.prevent.stop="toggleSaved"
          >
            <SVGIcon name="bookmark" />
          </button>
        </div>
      </div>
    </div>

    <!-- フィード説明文 -->
    <div
      class="custom-feed-card__description"
      dir="auto"
    >{{ generator.description }}</div>

    <div class="custom-feed-card__bottom">
      <!-- フィードオーダーボタン -->
      <template v-if="orderButtonDisplay">
        <button
          class="button--bordered"
          @click.prevent.stop="changeCustomFeedOrder('up')"
        >
          <SVGIcon name="cursorUp" />
        </button>
        <button
          class="button--bordered"
          @click.prevent.stop="changeCustomFeedOrder('down')"
        >
          <SVGIcon name="cursorDown" />
        </button>
      </template>

      <!-- フィード作成者 -->
      <RouterLink
        class="custom-feed-card__creator"
        :to="{ name: 'profile-post', query: { account: generator.creator.handle } }"
        @click.prevent
      >
        <SVGIcon name="person" />
        <div class="custom-feed-card__creator__display-name">{{ generator.creator.displayName }}</div>
        <div class="custom-feed-card__creator__handle">{{ generator.creator.handle }}</div>
      </RouterLink>
    </div>
    <Loader
      v-if="state.processing"
      @click.prevent
    />
  </RouterLink>
</template>

<style lang="scss" scoped>
.custom-feed-card {
  cursor: default;
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  position: relative;

  &__top {
    display: flex;
    align-items: center;
    grid-gap: 0.75em;

    &__right {
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-areas:
        "n n r"
        "l i r";
      flex-grow: 1;
      grid-gap: 0.25em 0.5em;

      &__right {
        grid-area: r;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        flex-grow: 1;
      }
    }
  }

  // フィード画像
  &__avatar {
    grid-area: a;
    border: 1px solid rgba(var(--accent-color), 0.25);
    border-radius: var(--border-radius);
    display: block;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
  }

  // フィード名
  &__display-name {
    grid-area: n;
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    overflow: hidden;

    & > .svg-icon {
      fill: rgb(var(--accent-color));
      font-size: 0.875em;
    }

    & > span {
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__like-count,
  &__indexed-at {
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    overflow: hidden;

    & > .svg-icon {
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // フィードライク数
  &__like-count {
    grid-area: l;

    & > .svg-icon {
      fill: rgba(var(--like-color), 0.75);
    }

    & > span {
      color: rgba(var(--fg-color), 0.75);
      font-weight: bold;
    }
  }

  // フィード作成日時
  &__indexed-at {
    grid-area: i;

    & > .svg-icon {
      fill: rgba(var(--fg-color), 0.75);
    }

    & > span {
      color: rgba(var(--fg-color), 0.75);
    }
  }

  // お気に入りフィード
  &__bookmark {
    --color: rgba(var(--accent-color), 0.875);
    cursor: pointer;
    margin: -1em;
    padding: 1em;
    &:focus, &:hover {
      --color: rgb(var(--accent-color));
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.5em;
    }
    &[data-saved="false"] > .svg-icon {
      fill: transparent;
      stroke: var(--color);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1px;
    }
  }

  // フィード説明文
  &__description {
    font-size: 0.875em;
    line-height: 1.25;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__bottom {
    display: flex;
    grid-gap: 0.5em;
  }

  // フィード作成者
  &__creator {
    background-color: rgb(var(--bg-color));
    border: 1px solid rgb(var(--accent-color), 0.25);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    grid-gap: 0.5em;
    margin-left: auto;
    padding: 0.5em 1em;
    &:focus, &:hover {
      border-color: rgb(var(--accent-color), 0.5);
    }

    & > .svg-icon {
      fill: rgba(var(--accent-color), 0.75);
      font-size: 0.75em;
    }

    &__display-name {
      font-size: 0.875em;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }

    &__handle {
      color: rgba(var(--fg-color), 0.75);
      font-size: 0.875em;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }
  }
}
</style>
