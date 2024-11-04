<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import HtmlText from "@/components/labels/HtmlText.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const router = useRouter()

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  starterPack?: TIStarterPack
  menuDisplay: boolean
  detailDisplay: boolean
  creatorDisplay: boolean
  unclickable: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkToParticularPage: ComputedRef<any>
  routerLinkToListPage: ComputedRef<any>
  indexedAt: ComputedRef<string>
  detailDisplay: boolean
  loaderDisplay: boolean
}>({
  routerLinkToParticularPage: computed(() => {
    return {
      path: "/home/starter-pack",
      query: {
        uri: props.starterPack?.uri,
      },
    }
  }),
  routerLinkToListPage: computed(() => {
    return {
      path: "/profile/starterPacks",
      query: {
        account: props.starterPack?.creator.did,
      },
    }
  }),
  indexedAt: computed((): string => {
    return mainState.formatDate(props.starterPack?.indexedAt)
  }),
  detailDisplay: props.detailDisplay,
  loaderDisplay: false,
})

function toggleDetailDisplay () {
  Util.blurElement()
  state.detailDisplay = !state.detailDisplay
}

function openPopover ($event: Event) {
  Util.blurElement()
  mainState.starterPackCardPopoverProps.starterPack = props.starterPack
  mainState.starterPackCardPopoverCallback = starterPackCardPopoverCallback
  mainState.openStarterPackCardPopover($event.target)
}

async function starterPackCardPopoverCallback (type: "startAwait" | "endAwait" | "editStarterPack" | "deleteStarterPack") {
  switch (type) {
    case "startAwait": {
      state.loaderDisplay = true
      break
    }
    case "endAwait": {
      state.loaderDisplay = false
      break
    }
    case "editStarterPack": {
      await editStarterPack()
      break
    }
    case "deleteStarterPack": {
      await deleteStarterPack()
      break
    }
  }
}

async function editStarterPack () {
  if (props.starterPack == null) {
    return
  }
  mainState.openStarterPackEditPopup({
    display: true,
    mode: "edit",
    starterPack: props.starterPack,
  })
}

async function deleteStarterPack () {
  if (props.starterPack == null) {
    return
  }

  // 削除APIをコール
  state.loaderDisplay = true
  const result = await mainState.atp.deleteStarterPack(props.starterPack.uri)
  state.loaderDisplay = false
  if (result instanceof Error) {
    mainState.openErrorPopup(result, "StarterPackCard/deleteStarterPack")
    return
  }
  emit("deleteStarterPack", props.starterPack)

  // 現在のスターターパック一覧から削除
  const index = mainState.currentAuthorStarterPacks
    .findIndex((starterPack) => {
      return starterPack.uri === props.starterPack?.uri
    })
  if (index !== - 1) {
    mainState.currentAuthorStarterPacks.splice(index, 1)
  }

  // 削除したスターターパックページにいる場合、スターターパック一覧ページへ強制遷移
  if (props.starterPack.creator.did === mainState.atp.session?.did &&
      mainState.currentPath === "/home/starter-pack" &&
      mainState.currentQuery.uri === props.starterPack.uri
  ) {
    await router.push({
      name: 'profile-starter-packs',
      query: { account: props.starterPack.creator.did },
    })
  }
}
</script>

<template>
  <component
    v-if="starterPack != null"
    class="starter-pack-card"
    :is="unclickable ? 'div' : 'RouterLink'"
    v-bind="unclickable ? null : {
      to: state.routerLinkToParticularPage,
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
        <!-- WANT: 後日再検証 -->
        <span>{{ starterPack.listItemCount ?? starterPack.list?.listItemCount ?? '-' }}</span>
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
    <template v-if="state.detailDisplay">
      <div v-if="starterPack.record?.description">
        <HtmlText
          v-if="starterPack.record?.description"
          class="starter-pack-card__description"
          dir="auto"
          :text="starterPack.record?.description"
          :facets="starterPack.record?.descriptionFacets"
          @onActivateMention="$emit('onActivateMention')"
          @onActivateHashTag="$emit('onActivateHashTag')"
        />
      </div>

      <!-- 作成者リンク -->
      <div v-if="
        creatorDisplay &&
        starterPack.creator.did &&
        starterPack.creator.handle
      ">
        <RouterLink
          class="textlink starter-pack-card__creator"
          :to="state.routerLinkToListPage"
          @click.prevent="$emit('onActivateMention')"
        >
          <span class="starter-pack-card__creator__prefix">{{ $t("by") }}</span>
          <span class="starter-pack-card__creator__display-name">{{ starterPack.creator.displayName || starterPack.creator.handle }}</span>
        </RouterLink>
      </div>
    </template>

    <Loader v-if="state.loaderDisplay" />
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
    background-color: rgb(var(--fg-color), 0.0625);
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
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;

    & > .svg-icon {
      fill: rgb(var(--starter-pack-color));
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
        fill: rgb(var(--fg-color), 0.5);
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
    color: rgb(var(--fg-color), 0.5);
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.375em;
    line-height: var(--line-height-high);

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
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

  // 説明文
  &__description {
    color: rgb(var(--fg-color), 0.75);
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
