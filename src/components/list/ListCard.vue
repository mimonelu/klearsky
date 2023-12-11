<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  list: TTList
  unclickable?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  routerLinkTo: ComputedRef<any>
  indexedAt: ComputedRef<string>
  purpose: ComputedRef<string>
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
})

function onClick () {
  if (!props.unclickable) mainState.currentList = props.list
}
</script>

<template>
  <component
    v-bind="unclickable ? null : { to: state.routerLinkTo }"
    :is="unclickable ? 'div' : 'RouterLink'"
    class="list-card"
    @click.native="onClick"
  >
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
  </component>
</template>

<style lang="scss" scoped>
.list-card {
  display: grid;
  grid-gap: 0.25em 0.75em;
  grid-template-columns: auto auto 1fr;
  grid-template-areas:
    "a n n m"
    "a p i m"
    "d d d d";
  align-items: flex-start;
  padding: 1em;

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
    display: flex;
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
    }
  }

  // リスト作成日時
  &__indexed-at {
    grid-area: i;
    color: var(--fg-color-05);
    display: flex;
    align-items: center;
    grid-gap: 0.5em;
    line-height: var(--line-height);

    & > .svg-icon {
      fill: var(--fg-color-05);
      font-size: 0.75em;
    }

    & > span {
      font-size: 0.875em;
    }
  }

  // リスト説明文
  &__description {
    grid-area: d;
    font-size: 0.875em;
    line-height: var(--line-height);
    margin-top: 0.25em;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
