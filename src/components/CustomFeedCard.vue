<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/HtmlText.vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  orderButtonDisplay: boolean
  creatorDisplay: boolean
  unclickable?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  saved: ComputedRef<boolean>
  pinned: ComputedRef<boolean>
}>({
  processing: false,
  saved: computed((): boolean => {
    return mainState.feedPreferences?.saved
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
  pinned: computed((): boolean => {
    return mainState.feedPreferences?.pinned
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
})

async function copyFeedName () {
  await navigator.clipboard.writeText(props.generator.uri)
}

async function toggleFeedGeneratorLike (generator: TTFeedGenerator) {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  if (generator.viewer.like == null) {
    const uri = await mainState.atp.createLike(generator.uri, generator.cid)
    if (uri != null) {
      generator.viewer.like = uri
      generator.likeCount ++
    } else {
      mainState.openErrorPopup("errorApiFailed", "CustomFeedCard/createLike")
    }
  } else {
    if (await mainState.atp.deleteLike(generator.viewer.like)) {
      delete generator.viewer.like
      generator.likeCount --
    } else {
      mainState.openErrorPopup("errorApiFailed", "CustomFeedCard/deleteLike")
    }
  }
  state.processing = false
}

async function toggleSavedOrPinned (type: "saved" | "pinned") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.feedPreferences == null) return
  if (mainState.feedPreferences[type] == null) mainState.feedPreferences[type] = []

  // フィードブックマーク／フィードピンの削除
  if (state[type]) {
    // フィードブックマークの削除はフィードピンが有効の場合のみ
    if (type === "saved" && state.pinned) return

    mainState.feedPreferences[type].splice(
      0,
      mainState.feedPreferences[type].length,
      ...mainState.feedPreferences[type].filter((uri: string) => uri !== props.generator.uri)
    )
  }

  // フィードブックマーク／フィードピンの追加
  else {
    // ピンの追加はフィードブックマークが無効の場合のみ
    if (type === "pinned" && !state.saved) return

    mainState.feedPreferences[type].push(props.generator.uri)
  }

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
  <component
    class="custom-feed-card"
    :is="unclickable ? 'div' : 'RouterLink'"
    v-bind="unclickable ? null : {
      to: {
        path: '/home/feeds',
        query: {
          feed: generator.uri,
          displayName: generator.displayName,
        },
      },
    }"
    :data-unclickable="unclickable"
    @click.stop
  >
    <div class="custom-feed-card__top">
      <!-- フィード画像 -->
      <img
        class="custom-feed-card__avatar"
        loading="lazy"
        decoding="async"
        :src="generator.avatar ?? '/img/void-avatar.png'"
        alt=""
      >

      <div class="custom-feed-card__top__right">
        <!-- フィード名 -->
        <div class="custom-feed-card__display-name">
          <span>{{ generator.displayName }}</span>

          <!-- フィード名コピーボタン -->
          <div class="custom-feed-card__display-name__copy-button">
            <SVGIcon
              name="clipboard"
              @click.prevent.stop="copyFeedName"
            />
          </div>
        </div>

        <!-- フィードライク数 -->
        <button
          class="custom-feed-card__like-count"
          :data-on="generator.viewer.like != null"
          @click.prevent.stop="toggleFeedGeneratorLike(generator)"
        >
          <SVGIcon name="heart" />
          <span>{{ generator.likeCount }}</span>
        </button>

        <!-- フィード作成日時 -->
        <div class="custom-feed-card__indexed-at">
          <SVGIcon name="clock" />
          <span>{{ mainState.formatDate(generator.indexedAt) }}</span>
        </div>

        <div class="custom-feed-card__top__right__right">
          <!-- フィードピン -->
          <button
            class="custom-feed-card__pin"
            @click.prevent.stop="toggleSavedOrPinned('pinned')"
          >
            <SVGIcon :name="state.pinned
              ? 'pin'
              : state.saved
                ? 'pinOutline'
                : 'pinOffOutline'
            " />
          </button>

          <!-- フィードブックマーク -->
          <button
            class="custom-feed-card__bookmark"
            @click.prevent.stop="toggleSavedOrPinned('saved')"
          >
            <SVGIcon :name="state.saved
              ? state.pinned
                ? 'bookmarkOff'
                : 'bookmark'
              : 'bookmarkOutline'
            " />
          </button>
        </div>
      </div>
    </div>

    <!-- フィード説明文 -->
    <HtmlText
      class="custom-feed-card__description"
      dir="auto"
      :text="generator.description ?? '&nbsp;'"
      @onActivateMention="emit('onActivateMention')"
      @onActivateHashTag="emit('onActivateHashTag')"
    />

    <div
      v-if="orderButtonDisplay || creatorDisplay"
      class="custom-feed-card__bottom"
    >
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
        v-if="creatorDisplay"
        class="custom-feed-card__creator"
        :to="{ name: 'profile-feeds', query: { account: generator.creator.handle } }"
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
  </component>
</template>

<style lang="scss" scoped>
.custom-feed-card {
  cursor: default;
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  position: relative;

  // テキスト選択
  &[data-unclickable="true"] &__display-name,
  &[data-unclickable="true"] &__description {
    cursor: auto;
    user-select: text;
  }

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
      grid-gap: 0.5em 0.75em;

      &__right {
        grid-area: r;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        flex-grow: 1;
        grid-gap: 1em;
      }
    }
  }

  // フィード画像
  &__avatar {
    grid-area: a;
    border-radius: var(--border-radius);
    display: block;
    overflow: hidden;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
  }

  // フィード名
  &__display-name {
    grid-area: n;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.5em;
    overflow: hidden;

    & > span {
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // フィード名コピーボタン
    &__copy-button {
      --opacity: 0.25;

      & > .svg-icon {
        cursor: pointer;
        fill: rgb(var(--fg-color), var(--opacity));
        font-size: 1.25em;
        &:focus, &:hover {
          --opacity: 0.5;
        }
      }
    }
  }

  &__like-count,
  &__indexed-at {
    display: flex;
    align-items: center;
    grid-gap: 0.5em;
    overflow: hidden;

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
    --color: var(--fg-color-05);
    cursor: pointer;
    grid-area: l;
    margin: -0.5em;
    padding: 0.5em;
    &[data-on="true"] {
      --color: var(--like-color-075);
      &:focus, &:hover {
        --color: rgb(var(--like-color));
      }
    }
    &[data-on="false"] {
      &:focus, &:hover {
        --color: rgb(var(--fg-color));
      }
    }

    & > .svg-icon {
      fill: var(--color);
    }

    & > span {
      color: var(--color);
      font-weight: bold;
    }
  }

  // フィード作成日時
  &__indexed-at {
    grid-area: i;

    & > .svg-icon {
      fill: var(--fg-color-05);
      font-size: 0.75em;
    }

    & > span {
      color: var(--fg-color-05);
    }
  }

  // フィードブックマーク・フィードピン
  &__bookmark,
  &__pin {
    --color: var(--accent-color-0875);
    cursor: pointer;
    margin: -0.5em;
    padding: 0.5em;
    &:focus, &:hover {
      --color: rgb(var(--accent-color));
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.5em;
    }
  }

  // フィード説明文
  &__description {
    font-size: 0.875em;
    line-height: var(--line-height);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__bottom {
    display: flex;
    grid-gap: 0.5em;
  }

  // フィード作成者
  &__creator {
    background-clip: padding-box;
    background-color: rgb(var(--bg-color));
    border: 1px solid var(--accent-color-025);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    grid-gap: 0.5em;
    margin-left: auto;
    padding: 0.5em 1em;
    &:focus, &:hover {
      border-color: var(--accent-color-05);
    }

    & > .svg-icon {
      fill: var(--accent-color-075);
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
      color: var(--fg-color-075);
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
