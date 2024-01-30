<script lang="ts" setup>
import { computed, inject, reactive, ref, type ComputedRef } from "vue"
import FeedCardMenuTicker from "@/components/menu-tickers/FeedCardMenuTicker.vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  menuDisplay: boolean
  orderButtonDisplay: boolean
  creatorDisplay: boolean
  unclickable?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkToFeedsPage: ComputedRef<any>
  processing: boolean
  saved: ComputedRef<boolean>
  pinned: ComputedRef<boolean>
  menuTickerDisplay: boolean
  menuTickerContainer: ComputedRef<undefined | HTMLElement>
}>({
  routerLinkToFeedsPage: computed(() => {
    return {
      path: "/home/feeds",
      query: {
        feed: props.generator.uri,
        displayName: props.generator.displayName,
      },
    }
  }),
  processing: false,
  saved: computed((): boolean => {
    return mainState.myFeeds.findIndexByUri(props.generator.uri) !== - 1
  }),
  pinned: computed((): boolean => {
    return mainState.feedPreferences?.pinned
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
  menuTickerDisplay: false,
  menuTickerContainer: computed((): undefined | HTMLElement => {
    return menuTicker.value?.closest(".popup-body") ?? undefined
  }),
})

const menuTicker = ref()

function openMenuTicker () {
  state.menuTickerDisplay = !state.menuTickerDisplay
}

function closeMenuTicker () {
  state.menuTickerDisplay = false
}

async function toggleFeedGeneratorLike (generator: TTFeedGenerator) {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  if (generator.viewer.like == null)
    await likeFeedGenerator(generator)
  else
    await unlikeFeedGenerator(generator)
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

    if (type === "saved") mainState.myFeeds.removeItem(props.generator.uri)
    const index = mainState.feedPreferences[type].findIndex((uri: string) => {
      return uri === props.generator.uri
    })
    if (index === - 1) return
    mainState.feedPreferences[type].splice(index, 1)

  // フィードブックマーク／フィードピンの追加
  } else {
    // ピンの追加はフィードブックマークが無効の場合のみ
    if (type === "pinned" && !state.saved) return

    if (type === "saved") mainState.myFeeds.addItem(props.generator)
    mainState.feedPreferences[type].push(props.generator.uri)
  }

  await updatePreferences()
}

async function likeFeedGenerator (generator: TTFeedGenerator) {
  const uri = await mainState.atp.createLike(generator.uri, generator.cid)
  if (uri != null) {
    generator.viewer.like = uri
    generator.likeCount ++
  } else {
    mainState.openErrorPopup("errorApiFailed", "FeedCard/createLike")
  }
}

async function unlikeFeedGenerator (generator: TTFeedGenerator) {
  if (await mainState.atp.deleteLike(generator.viewer.like as string)) {
    delete generator.viewer.like
    generator.likeCount --
  } else {
    mainState.openErrorPopup("errorApiFailed", "FeedCard/deleteLike")
  }
}

async function updatePreferences () {
  state.processing = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  if (!result) mainState.openErrorPopup("errorApiFailed", "FeedCard/updatePreferences")
  state.processing = false

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
    mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
  }
}

function changeCustomFeedOrder (direction: "up" | "down") {
  const index = mainState.myFeeds.findIndexByUri(props.generator.uri)
  if (index === - 1) return
  if (direction === "up" && index > 0)
    mainState.myFeeds.swapItem(index, index - 1)
  else if (direction === "down" && index < mainState.myFeeds.items.length - 1)
    mainState.myFeeds.swapItem(index, index + 1)
  emit("changeCustomFeedOrder")
}
</script>

<template>
  <component
    class="feed-card"
    :is="unclickable ? 'div' : 'RouterLink'"
    v-bind="unclickable ? null : {
      to: state.routerLinkToFeedsPage,
    }"
    :data-unclickable="unclickable"
    @click.stop
  >
    <div class="feed-card__detail">
      <!-- フィード画像 -->
      <LazyImage :src="generator.avatar" />

      <!-- フィード名 -->
      <div class="feed-card__display-name">
        <span>{{ generator.displayName }}</span>
      </div>

      <!-- フィードライク数 -->
      <button
        class="feed-card__like-count"
        :data-on="generator.viewer.like != null"
        @click.prevent.stop="toggleFeedGeneratorLike(generator)"
      >
        <SVGIcon name="like" />
        <span>{{ generator.likeCount }}</span>
      </button>

      <!-- フィード作成日時 -->
      <div class="feed-card__indexed-at">
        <SVGIcon name="clock" />
        <span>{{ mainState.formatDate(generator.indexedAt) }}</span>
      </div>

      <!-- フィードピン -->
      <button
        class="feed-card__pin"
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
        class="feed-card__bookmark"
        @click.prevent.stop="toggleSavedOrPinned('saved')"
      >
        <SVGIcon :name="state.saved
          ? state.pinned
            ? 'bookmarkOff'
            : 'bookmark'
          : 'bookmarkOutline'
        " />
      </button>

      <!-- フィードカードメニュートリガー -->
      <button
        v-if="menuDisplay"
        class="menu-button"
        ref="menuTicker"
        @click.prevent.stop="openMenuTicker"
      >
        <SVGIcon name="menu" />

        <!-- フィードカードメニュー -->
        <FeedCardMenuTicker
          :generator="generator"
          :display="state.menuTickerDisplay"
          :container="state.menuTickerContainer"
          @close="closeMenuTicker"
        />
      </button>
    </div>

    <div>
      <!-- フィード説明文 -->
      <HtmlText
        class="feed-card__description"
        dir="auto"
        :text="generator.description ?? '&nbsp;'"
        :processHashTag="true"
        @onActivateMention="emit('onActivateMention')"
        @onActivateHashTag="emit('onActivateHashTag')"
      />

      <!-- フィード作成者リンク -->
      <RouterLink
        v-if="creatorDisplay && generator.creator.did"
        class="textlink feed-card__creator"
        :to="{ name: 'profile-custom-feeds', query: { account: generator.creator.did } }"
        @click.prevent
      >
        <span class="feed-card__creator__prefix">{{ $t("by") }}</span>
        <span class="feed-card__creator__display-name">{{ generator.creator.displayName || generator.creator.handle }}</span>
      </RouterLink>
    </div>

    <div
      v-if="orderButtonDisplay || creatorDisplay"
      class="feed-card__bottom"
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
    </div>
    <Loader
      v-if="state.processing"
      @click.prevent
    />
  </component>
</template>

<style lang="scss" scoped>
.feed-card {
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

  &__detail {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto auto 1fr auto;
    grid-template-areas:
      "v v v v v v"
      "a n n p b m"
      "a l i i i m";
    align-items: flex-start;
  }

  // フィード画像
  .lazy-image {
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
    display: inline;
    font-weight: bold;
    line-height: var(--line-height);
    margin-bottom: 0.25em;
    word-break: break-all;
  }

  /*
  &__like-count,
  &__indexed-at {
    color: var(--fg-color-05);
    overflow: hidden;

    & > span {
      font-size: 0.875em;
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  */

  // フィードライク数
  // フィード作成日時
  &__like-count,
  &__indexed-at {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.5em;
    line-height: var(--line-height);

    & > .svg-icon {
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      white-space: nowrap;
    }
  }

  // フィードライク数
  &__like-count {
    --color: var(--fg-color-05);
    grid-area: l;
    cursor: pointer;
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
      font-size: 0.875em;
    }

    & > span {
      color: var(--color);
      font-weight: bold;
    }
  }

  // フィード作成日時
  &__indexed-at {
    grid-area: i;
    color: var(--fg-color-05);

    & > .svg-icon {
      fill: var(--fg-color-05);
    }
  }

  // フィードピン・フィードブックマーク・フィードカードメニュートリガー
  &__pin,
  &__bookmark,
  .menu-button {
    --color: var(--accent-color-0875);
    cursor: pointer;
    margin: -0.5em;
    padding: 0.5em;
    &:focus, &:hover {
      --color: rgb(var(--accent-color));
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.25em;
    }
  }

  // フィードピン
  &__pin {
    grid-area: p;
  }

  // フィードブックマーク
  &__bookmark {
    grid-area: b;
  }

  // フィードカードメニュートリガー
  .menu-button {
    --color: var(--fg-color-075);
    grid-area: m;
    &:focus, &:hover {
      --color: var(--fg-color-0875);
    }
  }

  .menu-ticker:deep() {
    & > .menu-ticker--inner {
      top: 3rem;
      right: 0.5rem;
    }
  }

  // フィード説明文
  &__description {
    color: rgb(var(--fg-color));
    font-size: 0.875em;
    line-height: var(--line-height);
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__bottom {
    color: rgb(var(--fg-color));
    display: flex;
    grid-gap: 0.5em;
  }

  // フィード作成者
  &__creator {
    font-size: 0.875em;
    line-height: var(--line-height);

    &__prefix {
      margin-right: 0.5em;
    }

    &__display-name {
      font-weight: bold;
    }
  }
}
</style>
