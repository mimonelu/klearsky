<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"

const props = defineProps<{
  links?: Array<TTProfileLink>
}>()

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

// favicon の読み込みに失敗したリンクの URI
const failedIconUris = reactive(new Set<string>())

// ラベル設定で非表示またはぼかし対象のリンクは表示しない
// NOTICE: リンクにはぼかしを表示できないため、ぼかし対象も非表示にする（公式クライアントと同様）
const visibleLinks = computed((): Array<TTProfileLink> => {
  return (props.links ?? []).filter((link) => {
    return !hasUserBlurLabel(mainState, link.labels)
  })
})

// タイトルがない場合はドメイン名を表示する
function getTitle (link: TTProfileLink): string {
  if (link.title) {
    return link.title
  }
  return Util.safeUrl(link.url)?.hostname.replace(/^www\./, "") ?? link.url
}
</script>

<template>
  <div
    v-if="visibleLinks.length > 0"
    class="profile-link-list"
  >
    <a
      v-for="link of visibleLinks"
      :key="link.uri"
      class="profile-link-list__item"
      :href="Util.safeExternalUrl(link.url)"
      rel="noreferrer"
      target="_blank"
      :title="link.url"
      @click="onClickExternalLink($event, link.url)"
    >
      <!-- favicon -->
      <img
        v-if="link.icon && !failedIconUris.has(link.uri)"
        :src="link.icon"
        alt=""
        loading="lazy"
        @error="failedIconUris.add(link.uri)"
      >
      <SVGIcon
        v-else
        name="link"
      />

      <span dir="auto">{{ getTitle(link) }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.profile-link-list {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;

  &__item {
    --alpha: 0.875;
    background-color: rgb(var(--fg-color), 0.0625);
    border-radius: 1.5em;
    display: flex;
    align-items: center;
    grid-gap: 0.375em;
    overflow: hidden;
    padding: 0.375em 0.75em;
    max-width: 100%;
    &:focus,
    &:hover {
      --alpha: 1.0;
      background-color: rgb(var(--fg-color), 0.125);
    }

    // favicon
    & > img {
      border-radius: var(--border-radius-middle);
      width: 1em;
      min-width: 1em;
      height: 1em;
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), var(--alpha));
      min-width: 1em;
    }

    & > span {
      font-size: 0.875em;
      font-weight: bold;
      line-height: var(--line-height-low);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
