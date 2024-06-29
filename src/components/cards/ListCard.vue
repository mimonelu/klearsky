<script lang="ts" setup>
import { computed, inject, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import HtmlText from "@/components/labels/HtmlText.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import OrderButtons from "@/components/buttons/OrderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import ViewerLabels from "@/components/labels/ViewerLabels.vue"

const router = useRouter()

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  list: TTList
  isCompact?: boolean
  menuDisplay: boolean
  detailDisplay: boolean
  orderButtonDisplay?: boolean
  createDisplay?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkToListFeeds: ComputedRef<any>
  routerLinkToListUsers: ComputedRef<any>
  isMuted: ComputedRef<boolean>
  isBlocked: ComputedRef<boolean>
  indexedAt: ComputedRef<string>
  purpose: ComputedRef<string>
  isOwn: ComputedRef<boolean>
  isListFeedsPage: boolean
  isListUsersPage: boolean
  saved: ComputedRef<boolean>
  pinned: ComputedRef<boolean>
  loaderDisplay: boolean
  detailDisplay: boolean
}>({
  routerLinkToListFeeds: computed(() => {
    return {
      path: "/home/list-feeds",
      query: {
        list: props.list.uri,
        displayName: props.list.name,
      },
    }
  }),
  routerLinkToListUsers: computed(() => {
    return {
      path: "/home/list-users",
      query: {
        list: props.list.uri,
        displayName: props.list.name,
      },
    }
  }),
  isMuted: computed((): boolean => {
    return props.list.viewer?.muted ?? false
  }),
  isBlocked: computed((): boolean => {
    return props.list.viewer?.blocked != null
  }),
  indexedAt: computed((): string => {
    return mainState.formatDate(props.list.indexedAt)
  }),
  purpose: computed((): string => {
    return mainState.myLists.getShortPurpose(props.list.purpose)
  }),
  isOwn: computed((): boolean => {
    return props.list.creator.did === mainState.atp.session?.did
  }),
  isListFeedsPage:
    mainState.currentPath === "/home/list-feeds" &&
    mainState.currentQuery.list === props.list.uri,
  isListUsersPage:
    mainState.currentPath === "/home/list-users" &&
    mainState.currentQuery.list === props.list.uri,
  saved: computed((): boolean => {
    return mainState.myFeeds.findIndexByUri(props.list.uri) !== - 1
  }),
  pinned: computed((): boolean => {
    return mainState.currentFeedPreference?.pinned
      .some((uri: string) => uri === props.list.uri) ?? false
  }),
  loaderDisplay: false,
  detailDisplay: props.detailDisplay,
})

function toggleDetailDisplay () {
  Util.blurElement()
  if (props.isCompact) {
    return
  }
  state.detailDisplay = !state.detailDisplay
}

function openListEditPopup () {
  mainState.openListEditPopup({
    mode: "edit",
    list: props.list,
    callback: updateList,
  })
}

function openListCardPopover ($event: Event) {
  Util.blurElement()
  mainState.listCardPopoverProps.list = props.list
  mainState.listCardPopoverCallback = listCardPopoverCallback
  mainState.openListCardPopover($event.target)
}

async function listCardPopoverCallback (type: "startAwait" | "endAwait" | "deleteList") {
  switch (type) {
    case "startAwait": {
      state.loaderDisplay = true
      break
    }
    case "endAwait": {
      state.loaderDisplay = false
      break
    }
    case "deleteList": {
      await deleteList()
      break
    }
  }
}

function updateList (list: TTList) {
  props.list.avatar = list.avatar
  props.list.name = list.name
  props.list.description = list.description
  props.list.purpose = list.purpose

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

async function deleteList () {
  state.loaderDisplay = true
  const result = await mainState.atp.deleteList(props.list.uri)
  state.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "ListCard/deleteList")
    return
  }
  emit("deleteList", props.list)

  // マイフィードから削除
  if (mainState.myFeeds.removeItem(props.list.uri)) {
    mainState.sortFeedPreferencesSavedAndPinned()
    mainState.myFeeds.saveCustomItemSettings()
    await updatePreferences()
  }

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)

  // 削除したマイリストのリストフィード／ユーザーページにいる場合、リスト作成ユーザーのリスト一覧ページへ強制遷移
  if (props.list.creator.did === mainState.atp.session?.did &&
      (
        mainState.currentPath === "/home/list-feeds" ||
        mainState.currentPath === "/home/list-users"
      ) &&
      mainState.currentQuery.list === props.list.uri) {
    await router.push({ name: 'profile-list', query: { account: props.list.creator.did } })
  }
}

async function toggleSavedOrPinned (type: "saved" | "pinned") {
  Util.blurElement()
  if (state.loaderDisplay) return
  if (mainState.currentFeedPreference == null) return
  if (mainState.currentFeedPreference[type] == null) mainState.currentFeedPreference[type] = []

  // フィードブックマーク／フィードピンの削除
  if (state[type]) {
    // フィードブックマークの削除はフィードピンが有効の場合のみ
    if (type === "saved" && state.pinned) return

    if (type === "saved") mainState.myFeeds.removeItem(props.list.uri)
    const index = mainState.currentFeedPreference[type].findIndex((uri: string) => {
      return uri === props.list.uri
    })
    if (index === - 1) return
    mainState.currentFeedPreference[type].splice(index, 1)

  // フィードブックマーク／フィードピンの追加
  } else {
    // ピンの追加はフィードブックマークが無効の場合のみ
    if (type === "pinned" && !state.saved) return

    if (type === "saved") mainState.myFeeds.addItem(props.list)
    mainState.currentFeedPreference[type].push(props.list.uri)
  }

  await updatePreferences()
}

async function updatePreferences () {
  state.loaderDisplay = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  state.loaderDisplay = false
  if (!result) {
    mainState.openErrorPopup("errorApiFailed", "ListCard/updatePreferences")
  }

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
    mainState.myWorker.setSessionCache("myFeedsItems", mainState.myFeeds.items)
  }
}

function changeCustomFeedOrder (direction: "top" | "up" | "down" | "bottom") {
  emit("changeCustomFeedOrder", {
    direction,
    item: props.list,
  })
}
</script>

<template>
  <div
    class="list-card"
    :data-is-compact="isCompact"
    :data-purpose="state.purpose"
  >
    <slot :list="list" />

    <!-- リスト詳細 -->
    <div class="list-card__detail">
      <!-- Viewer ラベル -->
      <ViewerLabels
        v-if="state.isMuted || state.isBlocked"
        :viewer="list.viewer as any"
      />

      <!-- リスト画像 -->
      <LazyImage
        class="list-card__avatar"
        :src="list.avatar"
      />

      <!-- リスト名 -->
      <div class="list-card__name">
        <button
          type="button"
          @click.prevent.stop="toggleDetailDisplay"
        >
          <SVGIcon :name="state.detailDisplay ? 'cursorDown' : 'cursorUp'" />
          <span class="list-card__name__label">{{ list.name }}</span>

          <!-- リストユーザー数 -->
          <span class="list-card__name__number">({{ list.listItemCount }})</span>
        </button>
      </div>

      <!-- リスト種別 -->
      <div
        class="list-card__purpose"
        :data-purpose="state.purpose"
      >
        <SVGIcon :name="state.purpose === 'curatelist'
          ? 'person'
          : state.purpose === 'modlist'
            ? 'personOff'
            : state.purpose === 'referencelist'
              ? 'cards'
              : 'help'" />
        <span>{{ $t(state.purpose) }}</span>
      </div>

      <!-- リスト作成日時 -->
      <div class="list-card__indexed-at">
        <SVGIcon name="clock" />
        <span>{{ state.indexedAt }}</span>
      </div>

      <!-- フィードピン -->
      <button
        v-if="!isCompact"
        class="list-card__pin"
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
        v-if="!isCompact"
        class="list-card__bookmark"
        @click.prevent.stop="toggleSavedOrPinned('saved')"
      >
        <SVGIcon :name="state.saved
          ? state.pinned
            ? 'bookmarkOff'
            : 'bookmark'
          : 'bookmarkOutline'
        " />
      </button>

      <!-- リストポップオーバートリガー -->
      <button
        v-if="menuDisplay && !isCompact"
        class="list-card__menu-button"
        @click.stop.prevent="openListCardPopover"
      >
        <SVGIcon name="menu" />
      </button>
    </div>

    <!-- リスト説明文 -->
    <div v-if="state.detailDisplay && !isCompact && (list.description || !state.isOwn)">
      <HtmlText
        v-if="list.description"
        class="list-card__description"
        dir="auto"
        :text="list.description"
        :facets="list.descriptionFacets"
        :processHashTag="true"
        @onActivateMention="$emit('onActivateMention')"
        @onActivateHashTag="$emit('onActivateHashTag')"
      />

      <!-- リスト作成者リンク -->
      <div v-if="!state.isOwn && list.creator.did">
        <RouterLink
          class="textlink list-card__creator"
          :to="{ name: 'profile-list', query: { account: list.creator.did } }"
          @click.prevent="$emit('onActivateMention')"
        >
          <span class="list-card__creator__prefix">{{ $t("by") }}</span>
          <span class="list-card__creator__display-name">{{ list.creator.displayName || list.creator.handle }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- その他のボタンコンテナ -->
    <div
      v-if="orderButtonDisplay && !isCompact"
      class="list-card__etc-button-container"
    >
      <!-- オーダーボタン -->
      <OrderButtons
        @moveTop="changeCustomFeedOrder('top')"
        @moveUp="changeCustomFeedOrder('up')"
        @moveDown="changeCustomFeedOrder('down')"
        @moveBottom="changeCustomFeedOrder('bottom')"
      />
    </div>

    <!-- リストボタンコンテナ -->
    <div
      v-if="!!props.list.cid && !isCompact && menuDisplay"
      class="list-card__list-button-container group-buttons"
    >
      <!-- リストフィードボタン -->
      <RouterLink
        :class="`${state.isListFeedsPage ? 'button--plane' : 'button--bordered'} list-card__feeds-button`"
        :disabled="state.isListFeedsPage"
        :to="state.routerLinkToListFeeds"
        @click.prevent="$emit('close')"
      >
        <SVGIcon name="post" />
        <span>{{ $t("feeds") }}</span>
      </RouterLink>

      <!-- リストユーザー一覧ボタン -->
      <RouterLink
        :class="`${state.isListUsersPage ? 'button--plane' : 'button--bordered'} list-card__users-button`"
        :disabled="state.isListUsersPage"
        :to="state.routerLinkToListUsers"
        @click.prevent="$emit('close')"
      >
        <SVGIcon name="people" />
        <span>{{ $t("users") }}</span>
      </RouterLink>

      <!-- リスト編集ボタン -->
      <button
        v-if="state.isOwn"
        class="button list-card__edit-button"
        @click.stop.prevent="openListEditPopup"
      >
        <span>{{ $t("listEditShort") }}</span>
      </button>
    </div>

    <Loader v-if="state.loaderDisplay" />
  </div>
</template>

<style lang="scss" scoped>
.list-card {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  position: relative;
  &[data-purpose="unknownlist"] {
    background-color: var(--fg-color-00625);
  }

  // リスト詳細
  &__detail {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto auto 1fr auto auto auto;
    grid-template-areas:
      "v v v v v v"
      "a n n p b m"
      "a t i i i m";
    align-items: flex-start;
  }

  // リスト詳細 - コンパクトモードのリストメニュー非表示に関わるレイアウト調整
  &[data-is-compact="true"] &__detail {
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      "v v v"
      "a n n"
      "a t i";

    .list-card__name {
      pointer-events: none;

      .svg-icon {
        display: none;
      }

      &__label {
        text-decoration: unset;
      }
    }
  }

  // Viewer ラベル
  .viewer-labels {
    grid-area: v;
    font-size: 0.75rem;
    margin-bottom: 0.5em;
  }

  // リスト画像
  &__avatar {
    grid-area: a;
    border-radius: var(--border-radius-middle);
    display: block;
    overflow: hidden;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
  }

  // リスト名
  &__name {
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
        fill: var(--fg-color-05);
        font-size: 0.875em;
      }

      &:focus, &:hover {
        .list-card__name__label {
          text-decoration: underline;
          text-underline-offset: 0.25em;
        }
      }
    }

    &__label {
      font-weight: bold;
      line-height: var(--line-height-high);
      word-break: break-word;
    }

    // リストユーザー数
    &__number {
      color: var(--fg-color-05);
    }
  }

  // リスト種別
  &__purpose {
    grid-area: t;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.375em;
    line-height: var(--line-height-high);
    &[data-purpose="curatelist"] {
      --color: rgb(var(--share-color));
    }
    &[data-purpose="modlist"] {
      --color: rgb(var(--notice-color));
    }
    &[data-purpose="referencelist"] {
      --color: rgb(var(--like-color));

      & > .svg-icon {
        font-size: 0.875em;
      }
    }
    &[data-purpose="unknownlist"] {
      --color: var(--fg-color-05);
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 0.75em;
    }

    & > span {
      color: var(--color);
      font-size: 0.875em;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // リスト作成日時
  &__indexed-at {
    grid-area: i;
    color: var(--fg-color-05);
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.375em;
    line-height: var(--line-height-high);

    & > .svg-icon {
      fill: var(--fg-color-05);
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // フィードピン・フィードブックマーク
  &__pin,
  &__bookmark {
    --color: var(--accent-color-0875);
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

  // リストポップオーバートリガー
  &__menu-button {
    --color: var(--fg-color-075);
    grid-area: m;
    cursor: pointer;
    margin: -0.625em;
    padding: 0.625em;
    &:focus, &:hover {
      --color: var(--fg-color-0875);
    }

    & > .svg-icon {
      fill: var(--color);
      font-size: 1.25em;
      pointer-events: none;
    }
  }

  // リスト説明文
  &__description {
    color: var(--fg-color-075);
    font-size: 0.875em;
    line-height: var(--line-height-high);
    white-space: pre-wrap;
    word-break: break-word;
  }

  // リスト作成者リンク
  &__creator {
    font-size: 0.875em;
    line-height: var(--line-height-high);

    &__prefix {
      margin-right: 0.5em;
    }

    &__display-name {
      font-weight: bold;
    }
  }

  // その他のボタンコンテナ
  &__etc-button-container {
    display: flex;
    justify-content: flex-end;
    grid-gap: 0.5em;
  }

  // リストボタンコンテナ
  &__list-button-container {
    justify-content: flex-end;
  }

  // リストフィードボタン
  // リストユーザー一覧ボタン
  // リスト編集ボタン
  &__feeds-button,
  &__users-button,
  &__edit-button {
    font-size: 0.875em;
    &.button--plane {
      background-color: var(--accent-color-025);
    }

    & > span {
      white-space: nowrap;
    }

    &[disabled="true"] {
      opacity: unset;

      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }

      & > span {
        color: rgb(var(--fg-color));
      }
    }
  }

  // リストチェックアイコン
  &:deep() {
    .list-card__check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 3em;

      & > .svg-icon {
        font-size: 1.5em;
      }
      &[data-checked="true"] {
        fill: rgb(var(--fg-color));
      }
      &[data-checked="false"] {
        fill: var(--fg-color-025);
      }
    }
  }
}

// オーダーボタン
.order-buttons {
  font-size: 0.875em;
}
</style>
