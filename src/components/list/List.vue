<script lang="ts" setup>
import { computed, inject, reactive, ref, type ComputedRef } from "vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const props = defineProps<{
  list: TTList
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  indexedAt: ComputedRef<string>
  purpose: ComputedRef<string>
}>({
  indexedAt: computed((): string => {
    return mainState.formatDate(props.list.indexedAt)
  }),
  purpose: computed((): string => {
    if (props.list.purpose.includes("#modlist")) return "modList"
    else if (props.list.purpose.includes("#curatelist")) return "curateList"
    return "unknownList"
  }),
})
</script>

<template>
  <div
    class="list"
    tabindex="0"
  >
    <!-- リスト画像 -->
    <LazyImage :src="list.avatar" />

    <div class="list__name">{{ list.name }}</div>
    <div
      class="list__purpose"
      :data-purpose="state.purpose"
    >
      <SVGIcon :name="state.purpose === 'curateList'
        ? 'person'
        : state.purpose === 'modList'
          ? 'personOff'
          : 'help'" />
      <span>{{ $t(state.purpose) }}</span>
    </div>
    <div class="list__indexed-at">
      <SVGIcon name="clock" />
      <span>{{ state.indexedAt }}</span>
    </div>

    <!-- リスト説明文 -->
    <HtmlText
      v-if="list.description"
      class="list__description"
      dir="auto"
      :text="list.description"
      :facets="list.descriptionFacets"
      :processHashTag="true"
      @onActivateMention="$emit('onActivateMention')"
      @onActivateHashTag="$emit('onActivateHashTag')"
    />
  </div>
</template>

<style lang="scss" scoped>
.list {
  display: grid;
  grid-gap: 0 0.75em;
  grid-template-columns: auto auto 1fr;
  grid-template-areas:
    "a n n m"
    "a p i m"
    "d d d d";
  align-items: center;
  padding: 1em;

  &__name {
    grid-area: n;
    font-weight: bold;
    line-height: var(--line-height);
  }

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

  &__description {
    grid-area: d;
    font-size: 0.875em;
    line-height: var(--line-height);
    margin-top: 0.5em;
    white-space: pre-wrap;
  }
}

// リスト画像
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
</style>
