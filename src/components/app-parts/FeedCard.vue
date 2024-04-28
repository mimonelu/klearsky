<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import OrderButtons from "@/components/buttons/OrderButtons.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(name: string, params?: any): void}>()

const props = defineProps<{
  generator: TTFeedGenerator
  menuDisplay: boolean
  toggleDisplay: boolean
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
    return mainState.myFeeds.findIndexByUri(props.generator.uri) !== - 1
  }),
  pinned: computed((): boolean => {
    return mainState.feedPreferences?.pinned
      .some((uri: string) => uri === props.generator.uri) ?? false
  }),
  detailDisplay: !props.toggleDisplay,
  isUnknown: !props.generator.cid
})

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

async function toggleSavedOrPinned (type: "saved" | "pinned") {
  Util.blurElement()
  if (state.loaderDisplay) return
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
  state.loaderDisplay = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  if (!result) mainState.openErrorPopup("errorApiFailed", "FeedCard/updatePreferences")
  state.loaderDisplay = false

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
    mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
  }
}

function changeCustomFeedOrder (direction: "top" | "up" | "down" | "bottom") {
  emit("changeCustomFeedOrder", {
    direction,
    item: props.generator,
  })
}

function toggleDetail () {
  state.detailDisplay = !state.detailDisplay
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
        <span>{{ generator.displayName }}</span>
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
        :text="generator.description ?? '&nbsp;'"
        :processHashTag="true"
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
          :to="{ name: 'profile-custom-feeds', query: { account: generator.creator.did } }"
          @click.prevent
        >
          <span>{{ $t("by") }} <b>{{ generator.creator.displayName || generator.creator.handle }}</b></span>
        </RouterLink>

        <!-- SkyFeed ラベル -->
        <div
          v-if="generator.did === 'did:web:skyfeed.me'"
          class="feed-card__creator__via"
        >(SkyFeed)</div>
      </div>
    </div>

    <!-- その他のボタンコンテナ -->
    <div
      v-if="toggleDisplay"
      class="feed-card__etc-button-container"
    >
      <!-- オーダーボタン -->
      <OrderButtons
        v-if="orderButtonDisplay"
        @moveTop="changeCustomFeedOrder('top')"
        @moveUp="changeCustomFeedOrder('up')"
        @moveDown="changeCustomFeedOrder('down')"
        @moveBottom="changeCustomFeedOrder('bottom')"
      />

      <!-- 詳細トグル -->
      <button
        class="button--bordered feed-card__detail-toggle"
        @click.prevent.stop="toggleDetail"
      >
        <SVGIcon :name="state.detailDisplay ? 'cursorUp' : 'cursorDown'" />
      </button>
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
    background-color: var(--fg-color-00625);
  }

  // テキスト選択
  &[data-unclickable="true"] &__display-name,
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
      overflow: hidden;
      text-overflow: ellipsis;
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

  // フィードピン・フィードブックマーク
  &__pin,
  &__bookmark {
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
  &__menu-button {
    --color: var(--fg-color-075);
    grid-area: m;
    cursor: pointer;
    margin: -1em;
    padding: 1em;
    &:focus, &:hover {
      --color: var(--fg-color-0875);
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.25em;
      pointer-events: none;
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

  // フィード作成者
  &__creator {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 0.875em;
    grid-gap: 0 0.5rem;

    &__by {
      line-height: var(--line-height);
      word-break: break-word;

      b {
        font-weight: bold;
      }
    }

    &__via {
      color: var(--fg-color-05);
      line-height: var(--line-height);
      word-break: break-word;
    }
  }

  // その他のボタンコンテナ
  &__etc-button-container {
    display: flex;
    grid-gap: 0.5em;
  }

  // 詳細トグル
  &__detail-toggle {
    font-size: 0.875em;
    margin-left: auto;
  }
}

// オーダーボタン
.order-buttons {
  font-size: 0.875em;
}
</style>
