<script lang="ts" setup>
import { computed, inject, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import ListMenuTicker from "@/components/menu-tickers/ListMenuTicker.vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const router = useRouter()

const emit = defineEmits<{(event: string, list?: TTList): void}>()

const props = defineProps<{
  list: TTList
  isCompact?: boolean
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
  menuTickerDisplay: boolean
  menuTickerContainer: ComputedRef<undefined | HTMLElement>
  loaderDisplay: boolean
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
    if (props.list.purpose.includes("#modlist")) return "modList"
    else if (props.list.purpose.includes("#curatelist")) return "curateList"
    return "unknownList"
  }),
  isOwn: computed((): boolean => {
    return props.list.creator.did === mainState.atp.session?.did
  }),
  isListFeedsPage: mainState.currentPath === "/home/list-feeds"
    && mainState.currentQuery.list === props.list.uri,
  isListUsersPage: mainState.currentPath === "/home/list-users"
    && mainState.currentQuery.list === props.list.uri,
  menuTickerDisplay: false,
  menuTickerContainer: computed((): undefined | HTMLElement => {
    return menuTickerContainer.value?.closest(".popup-body") ?? undefined
  }),
  loaderDisplay: false,
})

const menuTickerContainer = ref()

function openListEditPopup () {
  mainState.openListEditPopup({
    mode: "edit",
    list: props.list,
    callback: updateList,
  })
}

function updateList (list: TTList) {
  props.list.avatar = list.avatar
  props.list.name = list.name
  props.list.description = list.description
}

function openMenuTicker () {
  state.menuTickerDisplay = !state.menuTickerDisplay
}

function closeMenuTicker () {
  state.menuTickerDisplay = false
}

async function deleteList () {
  state.loaderDisplay = true
  const result = await mainState.atp.deleteList(props.list.uri)
  state.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "ListMenuTicker/deleteList")
    return
  }
  emit("deleteList", props.list)

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

function startAwait () {
  state.loaderDisplay = true
}

function endAwait () {
  state.loaderDisplay = false
}
</script>

<template>
  <div
    class="list-card"
    :data-is-compact="isCompact"
    :data-purpose="state.purpose"
  >
    <slot :list="list" />

    <!-- リストヘッダー -->
    <div
      v-if="state.isMuted || state.isBlocked"
      class="list-card__header"
    >
      <!-- リストミュートラベル-->
      <div
        v-if="state.isMuted"
        class="list-card__muted-label"
      >
        <SVGIcon name="volumeOff" />
        <span>{{ $t("listMuted") }}</span>
      </div>

      <!-- リストブロックラベル-->
      <div
        v-if="state.isBlocked"
        class="list-card__blocked-label"
      >
        <SVGIcon name="personOff" />
        <span>{{ $t("listBlocked") }}</span>
      </div>
    </div>

    <!-- リスト詳細 -->
    <div class="list-card__detail">
      <!-- リスト画像 -->
      <LazyImage
        class="list-card__avatar"
        :src="list.avatar"
      />

      <!-- リスト名 -->
      <div class="list-card__name">
        <span class="list-card__name__label">{{ list.name }}</span>

        <!-- リストユーザー数 -->
        <span
          v-if="list.items != null"
          class="list-card__name__number"
        >({{ list.items.length }})</span>
      </div>

      <!-- リスト種別 -->
      <div
        class="list-card__purpose"
        :data-purpose="state.purpose"
      >
        <SVGIcon :name="state.purpose === 'curateList'
          ? 'person'
          : state.purpose === 'modList'
            ? 'personOff'
            : 'help'" />
        <span>{{ $t(state.purpose) }}</span>
      </div>

      <!-- リスト作成日時 -->
      <div class="list-card__indexed-at">
        <SVGIcon name="clock" />
        <span>{{ state.indexedAt }}</span>
      </div>

      <!-- リストメニュートリガー -->
      <button
        v-if="!isCompact"
        class="list-card__menu-button"
        ref="menuTickerContainer"
        @click.prevent.stop="openMenuTicker"
      >
        <SVGIcon name="menu" />

        <!-- リストメニュー -->
        <ListMenuTicker
          :list="list"
          :display="state.menuTickerDisplay"
          :container="state.menuTickerContainer"
          @close="closeMenuTicker"
          @deleteList="deleteList"
          @startAwait="startAwait"
          @endAwait="endAwait"
        />
      </button>
    </div>

    <!-- リスト説明文 -->
    <HtmlText
      v-if="list.description && !isCompact"
      class="list-card__description"
      dir="auto"
      :text="list.description"
      :facets="list.descriptionFacets"
      :processHashTag="true"
      @onActivateMention="$emit('onActivateMention')"
      @onActivateHashTag="$emit('onActivateHashTag')"
    />

    <!-- ボタンコンテナ -->
    <div
      v-if="!isCompact"
      class="list-card__button-container"
    >
      <!-- リスト作成者リンク -->
      <RouterLink
        v-if="!state.isOwn"
        class="list-card__creator"
        :to="{ name: 'profile-list', query: { account: list.creator.did } }"
        @click.prevent.stop
      >
        <SVGIcon name="person" />
        <div class="list-card__creator__display-name">{{ list.creator.displayName }}</div>
        <div class="list-card__creator__handle">{{ list.creator.handle }}</div>
      </RouterLink>
      <div v-else />

      <!-- リストフィードボタン -->
      <RouterLink
        :class="`${state.isListFeedsPage ? 'button--plane' : 'button--bordered'} list-card__feeds-button`"
        :disabled="state.isListFeedsPage"
        :to="state.routerLinkToListFeeds"
        @click.prevent.stop="$emit('close')"
      >
        <SVGIcon name="post" />
        <span>{{ $t("feeds") }}</span>
      </RouterLink>

      <!-- リストユーザー一覧ボタン -->
      <RouterLink
        :class="`${state.isListUsersPage ? 'button--plane' : 'button--bordered'} list-card__users-button`"
        :disabled="state.isListUsersPage"
        :to="state.routerLinkToListUsers"
        @click.prevent.stop="$emit('close')"
      >
        <SVGIcon name="people" />
        <span>{{ $t("users") }}</span>
      </RouterLink>

      <!-- リスト編集ボタン -->
      <button
        v-if="state.isOwn"
        class="button list-card__edit-button"
        @click.prevent.stop="openListEditPopup"
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
  &[data-purpose="modList"] {
    background-color: rgb(var(--notice-color), 0.0625);
  }
  &[data-purpose="unknownList"] {
    background-color: var(--fg-color-00625);
  }

  // リストヘッダー
  &__header {
    display: flex;
    grid-gap: 0.5em;
  }

  // リストミュートラベル
  // リストブロックラベル
  &__muted-label,
  &__blocked-label {
    background-color: rgb(var(--notice-color));
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    padding: 0.25em 0.5em;

    & > .svg-icon {
      fill: white;
      font-size: 0.75em;
    }

    & > span {
      color: white;
      font-size: 0.875em;
    }
  }

  // リスト詳細
  &__detail {
    display: grid;
    grid-gap: 0.25em 0.75em;
    grid-template-columns: auto auto 1fr auto;
    grid-template-areas:
      "a n n m"
      "a p i m";
    align-items: flex-start;
  }

  // リスト詳細 - コンパクトモードのリストメニュー非表示に関わるレイアウト調整
  &[data-is-compact="true"] &__detail {
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      "a n n"
      "a p i";
  }

  // リスト画像
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

  // リスト名
  &__name {
    grid-area: n;
    display: inline;
    font-weight: bold;
    line-height: var(--line-height);
    word-break: break-all;

    &__label {
      margin-right: 0.5em;
    }

    // リストユーザー数
    &__number {
      color: var(--fg-color-05);
    }
  }

  // リスト種別
  &__purpose {
    grid-area: p;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.5em;
    line-height: var(--line-height);
    &[data-purpose="curateList"] {
      --color: rgb(var(--share-color));
    }
    &[data-purpose="modList"] {
      --color: rgb(var(--notice-color));
    }
    &[data-purpose="unknownList"] {
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
    grid-gap: 0.5em;
    line-height: var(--line-height);

    & > .svg-icon {
      fill: var(--fg-color-05);
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
      white-space: nowrap;
    }
  }

  // リストメニュートリガー
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
    }
  }

  // リストメニュー
  .menu-ticker:deep() {
    & > .menu-ticker--inner {
      top: 3rem;
      right: 0.5rem;
    }
  }

  // リスト説明文
  &__description {
    font-size: 0.875em;
    line-height: var(--line-height);
    white-space: pre-wrap;
    word-break: break-word;
  }

  // ボタンコンテナ
  &__button-container {
    display: grid;
    grid-template-columns: 1fr max-content max-content max-content;
    justify-content: flex-end;

    & > *:not(:last-child) {
      margin-right: 0.5em;
    }
  }

  // リスト作成者リンク
  &__creator {
    background-clip: padding-box;
    background-color: rgb(var(--bg-color));
    border: 1px solid var(--accent-color-025);
    border-radius: var(--border-radius);
    display: grid;
    grid-template-columns: auto auto 1fr;
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
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
    }

    &__handle {
      color: var(--fg-color-075);
      font-size: 0.875em;
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
  }

  // リストフィードボタン
  // リストユーザー一覧ボタン
  // リスト編集ボタン
  &__feeds-button,
  &__users-button,
  &__edit-button {
    font-size: 0.875em;

    & > span {
      white-space: nowrap;
    }
  }
}
</style>
