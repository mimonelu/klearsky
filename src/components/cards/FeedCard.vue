<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import OrderButtons from "@/components/buttons/OrderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string, params?: any): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  menuDisplay: boolean
  detailDisplay: boolean
  orderButtonDisplay: boolean
  creatorDisplay: boolean
  unclickable?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkToFeedsPage: ComputedRef<any>
  loaderDisplay: boolean
  saved: ComputedRef<boolean>
  pinned: ComputedRef<boolean>
  detailDisplay: boolean
  isUnknown: boolean
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
  loaderDisplay: false,
  saved: computed((): boolean => {
    return mainState.myFeeds!.findIndexByUri(props.generator.uri) !== - 1
  }),
  pinned: computed((): boolean => {
    return mainState.currentFeedPreference?.pinned
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
  detailDisplay: props.detailDisplay,
  isUnknown: !props.generator.cid
})

function toggleDetailDisplay () {
  Util.blurElement()
  state.detailDisplay = !state.detailDisplay
}

function openFeedCardPopover ($event: Event) {
  Util.blurElement()
  mainState.feedCardPopoverProps.generator = props.generator
  mainState.openFeedCardPopover($event.target)
}

async function toggleFeedGeneratorLike (generator: TTFeedGenerator) {
  Util.blurElement()
  if (state.loaderDisplay) return
  state.loaderDisplay = true
  if (generator.viewer.like == null)
    await likeFeedGenerator(generator)
  else
    await unlikeFeedGenerator(generator)
  state.loaderDisplay = false
}

async function toggleSavedOrPinned (type: TTPreferenceFeedType) {
  Util.blurElement()
  if (state.loaderDisplay) {
    return
  }
  if (mainState.currentFeedPreference == null) {
    return
  }
  if (mainState.currentFeedPreference[type] == null) {
    mainState.currentFeedPreference[type] = []
  }

  // フィードブックマーク／フィードピンの削除
  if (state[type]) {
    // フィードブックマークの削除はフィードピンが有効の場合のみ
    if (type === "saved" && state.pinned) {
      return
    }

    if (type === "saved") {
      mainState.myFeeds!.removeItem(props.generator.uri)
    }
    if (!mainState.removeFeedPreferenceByUri(type, props.generator.uri)) {
      return
    }

  // フィードブックマーク／フィードピンの追加
  } else {
    // ピンの追加はフィードブックマークが無効の場合のみ
    if (type === "pinned" && !state.saved) {
      return
    }

    if (type === "saved") {
      mainState.myFeeds!.addItem(props.generator)
    }
    mainState.currentFeedPreference[type].push(props.generator.uri)
  }

  await updatePreferences()
}

async function likeFeedGenerator (generator: TTFeedGenerator) {
  const uri = await mainState.atp.createLike(generator.uri, generator.cid)
  if (uri instanceof Error) {
    mainState.openErrorPopup(uri, "FeedCard/createLike")
    return
  }
  generator.viewer.like = uri
  generator.likeCount ++
}

async function unlikeFeedGenerator (generator: TTFeedGenerator) {
  const result = await mainState.atp.deleteLike(generator.viewer.like as string)
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "FeedCard/deleteLike")
    return
  }
  delete generator.viewer.like
  generator.likeCount --
}

async function updatePreferences () {
  state.loaderDisplay = true
  const result = await mainState.updatePreferences()
  state.loaderDisplay = false
  if (!result) {
    return
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("currentPreferences", mainState.currentPreferences)
  mainState.myWorker!.setSessionCache("myFeedsItems", mainState.myFeeds!.items)
}

function changeCustomFeedOrder (direction: "top" | "up" | "down" | "bottom") {
  emit("changeCustomFeedOrder", {
    direction,
    item: props.generator,
  })
}
</script>

<template>
  <component
    class="feed-card"
    :is="unclickable || state.isUnknown ? 'div' : 'RouterLink'"
    v-bind="unclickable || state.isUnknown ? null : {
      to: state.routerLinkToFeedsPage,
    }"
    :data-is-unknown="state.isUnknown"
    :data-unclickable="unclickable"
    @click.stop
  >
    <div class="feed-card__detail">
      <!-- フィード画像 -->
      <LazyImage :src="generator.avatar" />

      <!-- フィード名 -->
      <div class="feed-card__display-name">
        <button
          type="button"
          @click.prevent.stop="toggleDetailDisplay"
        >
          <SVGIcon :name="state.detailDisplay ? 'cursorDown' : 'cursorUp'" />
          <span>{{ generator.displayName }}</span>
        </button>
      </div>

      <!-- フィードライク数 -->
      <button
        class="feed-card__like-count"
        :data-on="generator.viewer.like != null"
        @click.prevent.stop="!state.isUnknown && toggleFeedGeneratorLike(generator)"
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

      <!-- フィードカードポップオーバートリガー -->
      <button
        v-if="menuDisplay"
        class="feed-card__menu-button"
        @click.prevent.stop="openFeedCardPopover"
      >
        <SVGIcon name="menu" />
      </button>
    </div>

    <div v-if="state.detailDisplay">
      <!-- フィード説明文 -->
      <HtmlText
        class="feed-card__description"
        dir="auto"
        :text="generator.description ?? '&emsp;'"
        @onActivateMention="emit('onActivateMention')"
        @onActivateHashTag="emit('onActivateHashTag')"
      />

      <!-- フィード作成者リンク -->
      <div
        v-if="creatorDisplay && generator.creator.did"
        class="feed-card__creator"
      >
        <RouterLink
          class="textlink feed-card__creator__by"
          :to="{ name: 'profile-feed-generators', query: { account: generator.creator.did } }"
          @click.prevent
        >
          <span>{{ $t("by") }} <b>{{ generator.creator.displayName || generator.creator.handle }}</b></span>
        </RouterLink>

        <!-- SkyFeed ラベル -->
        <a
          v-if="generator.did === 'did:web:skyfeed.me'"
          class="feed-card__creator__via textlink--underline"
          href="https://skyfeed.app/"
          rel="noreferrer"
          target="_blank"
        >
          <span>(SkyFeed)</span>
        </a>

        <!-- Starrysky ラベル -->
        <a
          v-if="generator.did === 'did:web:starrysky-proxy.usounds.work'"
          class="feed-card__creator__via textlink--underline"
          href="https://starrysky-console.pages.dev/"
          rel="noreferrer"
          target="_blank"
        >
          <span>(Starrysky)</span>
        </a>
      </div>
    </div>

    <!-- その他のボタンコンテナ -->
    <div
      v-if="orderButtonDisplay"
      class="feed-card__etc-button-container"
    >
      <!-- オーダーボタン -->
      <OrderButtons
        @moveTop="changeCustomFeedOrder('top')"
        @moveUp="changeCustomFeedOrder('up')"
        @moveDown="changeCustomFeedOrder('down')"
        @moveBottom="changeCustomFeedOrder('bottom')"
      />
    </div>

    <Loader
      v-if="state.loaderDisplay"
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
  &[data-is-unknown="true"] {
    background-color: rgb(var(--fg-color), 0.0625);
  }

  // テキスト選択
  &[data-unclickable="true"] &__description {
    cursor: auto;
    user-select: text;
  }

  &__detail {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto auto 1fr auto auto auto;
    grid-template-areas:
      "v v v v v v"
      "a n n p b m"
      "a l i i i m";
    align-items: flex-start;
  }

  // フィード画像
  .lazy-image {
    grid-area: a;
    border-radius: var(--border-radius-middle);
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
    margin-bottom: 0.25em;

    & > button {
      cursor: pointer;
      display: flex;
      align-items: center;
      grid-gap: 0.5em;
      margin: -0.5em -0.5em 0;
      padding: 0.5em 0.5em 0;

      & > .svg-icon {
        fill: rgb(var(--fg-color), 0.5);
        font-size: 0.875em;
      }

      & > span {
        color: rgb(var(--fg-color));
        font-weight: bold;
        line-height: var(--line-height-low);
        word-break: break-word;
      }
      &:focus, &:hover {
        & > span {
          text-decoration: underline;
          text-underline-offset: 0.25em;
        }
      }
    }
  }

  // フィードライク数
  // フィード作成日時
  &__like-count,
  &__indexed-at {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.375em;
    line-height: var(--line-height-low);

    & > .svg-icon {
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // フィードライク数
  &__like-count {
    --color: rgb(var(--fg-color), 0.5);
    grid-area: l;
    cursor: pointer;
    margin: -0.5em;
    padding: 0.5em;
    &[data-on="true"] {
      --color: rgb(var(--like-color), 0.75);
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
    color: rgb(var(--fg-color), 0.5);

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
    }
  }

  // フィードピン・フィードブックマーク
  &__pin,
  &__bookmark {
    --color: rgb(var(--accent-color), 0.875);
    cursor: pointer;
    margin: -0.625em -0.125em -0.625em -0.625em;
    padding: 0.625em;
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
  &__menu-button {
    --color: rgb(var(--fg-color), 0.75);
    grid-area: m;
    cursor: pointer;
    margin: -0.625em;
    padding: 0.625em;
    &:focus, &:hover {
      --color: rgb(var(--fg-color), 0.875);
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.25em;
      pointer-events: none;
    }
  }

  // フィード説明文
  &__description {
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875em;
    line-height: var(--line-height-high);
    white-space: pre-wrap;
    word-break: break-word;
  }

  // フィード作成者
  &__creator {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 0.875em;
    grid-gap: 0 0.5rem;

    &__by {
      line-height: var(--line-height-high);
      word-break: break-word;

      b {
        font-weight: bold;
      }
    }

    &__via {
      color: rgb(var(--fg-color), 0.5);
      line-height: var(--line-height-high);
      word-break: break-word;
    }
  }

  // その他のボタンコンテナ
  &__etc-button-container {
    display: flex;
    justify-content: flex-end;
    grid-gap: 0.5em;
  }
}

// オーダーボタン
.order-buttons {
  font-size: 0.875em;
}
</style>
