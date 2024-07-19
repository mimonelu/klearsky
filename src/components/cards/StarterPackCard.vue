<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import HtmlText from "@/components/labels/HtmlText.vue"
// import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const router = useRouter()

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  starterPack: TIStarterPack
  menuDisplay: boolean
  detailDisplay: boolean
  creatorDisplay: boolean
  unclickable: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkToPage: ComputedRef<any>
  /*
  routerLinkToListFeeds: ComputedRef<any>
  routerLinkToListUsers: ComputedRef<any>
  */
  indexedAt: ComputedRef<string>
  /*
  purpose: ComputedRef<string>
  isOwn: ComputedRef<boolean>
  isListFeedsPage: boolean
  isListUsersPage: boolean
  loaderDisplay: boolean
  */
  detailDisplay: boolean
}>({
  routerLinkToPage: computed(() => {
    return {
      path: "/profile/starterPacks",
      query: {
        account: props.starterPack.creator.did,
      },
    }
  }),
  /*
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
  */
  indexedAt: computed((): string => {
    return mainState.formatDate(props.starterPack.indexedAt)
  }),
  /*
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
  loaderDisplay: false,
  */
  detailDisplay: props.detailDisplay,
})

function toggleDetailDisplay () {
  Util.blurElement()
  state.detailDisplay = !state.detailDisplay
}

function openListEditPopup () {
  /*
  mainState.openListEditPopup({
    starterPack: props.starterPack,
    callback: updateList,
  })
  */
}

function openPopover ($event: Event) {
  Util.blurElement()
  /*
  mainState.starterPackCardPopoverProps.list = props.list
  mainState.starterPackCardPopoverCallback = starterPackCardPopoverCallback
  mainState.openStarterPackCardPopover($event.target)
  */
}

/*
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
*/

/*
function updateList (list: TTList) {
  props.list.avatar = list.avatar
  props.list.name = list.name
  props.list.description = list.description
  props.list.purpose = list.purpose

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}
*/

/*
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
*/
</script>

<template>
  <component
    class="starter-pack-card"
    :is="unclickable ? 'div' : 'RouterLink'"
    v-bind="unclickable ? null : {
      to: state.routerLinkToPage,
    }"
    :data-unclickable="unclickable"
    @click.stop
  >
    <!-- 詳細 -->
    <div class="starter-pack-card__detail">
      <!-- サムネイル -->
      <div class="starter-pack-card__icon">
        <SVGIcon name="cards" />
      </div>

      <!-- 名称 -->
      <div class="starter-pack-card__name">
        <button
          type="button"
          @click.prevent.stop="toggleDetailDisplay"
        >
          <SVGIcon :name="state.detailDisplay ? 'cursorDown' : 'cursorUp'" />
          <span class="starter-pack-card__name__label">{{ starterPack.record?.name }}</span>
        </button>
      </div>

      <!-- フィード数 -->
      <div
        v-if="starterPack.record?.feeds != null"
        class="starter-pack-card__feeds_count"
      >
        <SVGIcon name="feed" />
        <span>{{ starterPack.record.feeds.length ?? '-' }}</span>
      </div>

      <!-- リストアイテム数 -->
      <div class="starter-pack-card__list_item_count">
        <SVGIcon name="list" />
        <span>{{ starterPack.listItemCount ?? '-' }}</span>
      </div>

      <!-- 使用数 -->
      <div
        v-if="starterPack.joinedAllTimeCount != null"
        class="starter-pack-card__joined_count"
      >
        <SVGIcon name="person" />
        <span>{{ starterPack.joinedAllTimeCount ?? '-' }} (+{{ starterPack.joinedWeekCount ?? '-' }})</span>
      </div>

      <!-- 作成日時 -->
      <div
        v-if="starterPack.indexedAt != null"
        class="starter-pack-card__indexed-at"
      >
        <SVGIcon name="clock" />
        <span>{{ state.indexedAt }}</span>
      </div>

      <!-- ポップオーバートリガー -->
      <button
        v-if="menuDisplay"
        class="starter-pack-card__menu-button"
        @click.stop.prevent="openPopover"
      >
        <SVGIcon name="menu" />
      </button>
    </div>

    <!-- 説明文 -->
    <div v-if="state.detailDisplay && starterPack.record?.description">
      <HtmlText
        v-if="starterPack.record?.description"
        class="starter-pack-card__description"
        dir="auto"
        :text="starterPack.record?.description"
        :facets="starterPack.record?.descriptionFacets"
        :processHashTag="true"
        @onActivateMention="$emit('onActivateMention')"
        @onActivateHashTag="$emit('onActivateHashTag')"
      />
    </div>

    <!-- 作成者リンク -->
    <div v-if="creatorDisplay && starterPack.creator.did">
      <RouterLink
        class="textlink starter-pack-card__creator"
        :to="state.routerLinkToPage"
        @click.prevent="$emit('onActivateMention')"
      >
        <span class="starter-pack-card__creator__prefix">{{ $t("by") }}</span>
        <span class="starter-pack-card__creator__display-name">{{ starterPack.creator.displayName || starterPack.creator.handle }}</span>
      </RouterLink>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.starter-pack-card {
  cursor: default;
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  position: relative;
  &[data-purpose="unknownlist"] {
    background-color: var(--fg-color-00625);
  }

  // スターターパック詳細
  &__detail {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto auto auto auto 1fr auto;
    grid-template-areas:
      "a n n n n m"
      "a f l j i m";
    align-items: flex-start;
  }

  // サムネイル
  &__icon {
    grid-area: a;
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;

    & > .svg-icon {
      fill: rgb(var(--like-color));
      font-size: 2em;
    }
  }

  // 名称
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
        .starter-pack-card__name__label {
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
  }

  // 名称下部にある変数群
  &__feeds_count,
  &__list_item_count,
  &__joined_count,
  &__indexed-at {
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

  // リストアイテム数
  &__list_item_count {
    grid-area: l;
  }

  // フィード数
  &__feeds_count {
    grid-area: f;
  }

  // 使用数
  &__joined_count {
    grid-area: j;
  }

  // 作成日時
  &__indexed-at {
    grid-area: i;
  }

  // ポップオーバートリガー
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

  // 説明文
  &__description {
    color: var(--fg-color-075);
    font-size: 0.875em;
    line-height: var(--line-height-high);
    white-space: pre-wrap;
    word-break: break-word;
  }
  &[data-unclickable="true"] &__description {
    cursor: auto;
    user-select: text;
  }

  // 作成者リンク
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
}
</style>