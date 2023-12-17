<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  list: TTList
  createDisplay?: boolean
  unclickable?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkTo: ComputedRef<any>
  indexedAt: ComputedRef<string>
  purpose: ComputedRef<string>
  isOwn: ComputedRef<boolean>
}>({
  routerLinkTo: computed(() => {
    return {
      path: "/home/list-feeds", // TODO: purpose で振り分けること
      query: {
        list: props.list.uri,
        displayName: props.list.name,
      },
    }
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
})

function onClick () {
  if (!props.unclickable) mainState.currentList = props.list
}
</script>

<template>
  <component
    v-bind="unclickable ? null : { to: state.routerLinkTo }"
    :is="unclickable || state.purpose === 'modList' ? 'div' : 'RouterLink'"
    class="list-card"
    :data-purpose="state.purpose"
    @click.native="onClick"
  >
    <div class="list-card__header">
      <!-- リスト画像 -->
      <LazyImage
        class="list-card__avatar"
        :src="list.avatar"
      />

      <!-- リスト名 -->
      <div class="list-card__name">{{ list.name }}</div>

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
    </div>

    <!-- リスト説明文 -->
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

    <!-- ボタンコンテナ -->
    <div
      v-if="createDisplay || state.isOwn"
      class="list-card__button-container"
    >
      <!-- リスト作成者リンク -->
      <RouterLink
        v-if="createDisplay"
        class="list-card__creator"
        :to="{ name: 'profile-list', query: { account: list.creator.did } }"
        @click.prevent
      >
        <SVGIcon name="person" />
        <div class="list-card__creator__display-name">{{ list.creator.displayName }}</div>
        <div class="list-card__creator__handle">{{ list.creator.handle }}</div>
      </RouterLink>
      <div v-else />

      <!-- リスト編集ボタン -->
      <button
        v-if="state.isOwn"
        class="button list-card__edit-button"
        @click.prevent
      >
        <SVGIcon name="edit" />
        <span>{{ $t("edit") }}</span>
      </button>

      <!-- リストユーザー一覧ボタン -->
      <button
        v-if="state.isOwn"
        class="button--bordered list-card__users-button"
        @click.prevent
      >
        <SVGIcon name="people" />
        <span>{{ $t("listUsers") }}</span>
      </button>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.list-card {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  &[data-purpose="modList"] {
    background-color: rgb(var(--notice-color), 0.0625);
  }

  // リストヘッダー
  &__header {
    display: grid;
    grid-gap: 0.25em 0.75em;
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      "a n n"
      "a p i";
    align-items: flex-start;
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
    font-weight: bold;
    line-height: var(--line-height);
    word-break: break-word;
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
    grid-gap: 0.5em;
    grid-template-columns: 1fr auto auto;
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

  // リスト編集ボタン
  // リストユーザー一覧ボタン
  &__edit-button,
  &__users-button {
    font-size: 0.875em;
  }
}
</style>
