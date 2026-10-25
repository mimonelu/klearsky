<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import DraggableList from "@/components/lists/DraggableList.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { hasUserBlurLabel } from "@/composables/util/use-content-labels"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"
import CONSTS from "@/consts/consts.json"

const props = defineProps<{
  links?: Array<TTProfileLink>

  // 編集モード。指定時は `links` の代わりに表示する
  drafts?: Array<TTProfileLinkDraft>
}>()

const emit = defineEmits<{
  (event: "add"): void
  (event: "edit", index: number): void
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

// favicon の読み込みに失敗した URL
const failedIconUrls = reactive(new Set<string>())

// ラベル設定で非表示またはぼかし対象のリンクは表示しない
// NOTICE: リンクにはぼかしを表示できないため、ぼかし対象も非表示にする（公式クライアントと同様）
const visibleLinks = computed((): Array<TTProfileLink> => {
  return (props.links ?? []).filter((link) => {
    return !hasUserBlurLabel(mainState, link.labels)
  })
})

// タイトルがない場合はドメイン名を表示する
function getTitle (link: { url: string, title?: string }): string {
  if (link.title) {
    return link.title
  }
  return Util.safeUrl(link.url)?.hostname.replace(/^www\./, "") ?? link.url
}
</script>

<template>
  <!-- 編集モード -->
  <div
    v-if="drafts != null"
    class="profile-link-list profile-link-list--edit"
  >
    <DraggableList
      v-slot="{ item, index, focused }"
      class="profile-link-list__draggable-list"
      :items="drafts"
    >
      <button
        type="button"
        class="profile-link-list__item"
        :data-focused="focused"
        :title="item.url"
        @click.prevent="emit('edit', index)"
      >
        <!-- D&D ハンドル -->
        <SVGIcon name="drag" />

        <!-- favicon -->
        <img
          v-if="item.iconUrl && !failedIconUrls.has(item.iconUrl)"
          :src="item.iconUrl"
          alt=""
          loading="lazy"
          @error="failedIconUrls.add(item.iconUrl)"
        >
        <SVGIcon
          v-else
          name="link"
        />

        <span dir="auto">{{ getTitle(item) }}</span>
      </button>
    </DraggableList>

    <!-- 追加ボタン -->
    <button
      v-if="drafts.length < CONSTS.MAX_PROFILE_LINKS"
      type="button"
      class="profile-link-list__item profile-link-list__add-button"
      @click.prevent="emit('add')"
    >
      <SVGIcon name="plus" />
      <span>{{ $t("add") }}</span>
    </button>
  </div>

  <!-- 閲覧モード -->
  <div
    v-else-if="visibleLinks.length > 0"
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
        v-if="link.icon && !failedIconUrls.has(link.icon)"
        :src="link.icon"
        alt=""
        loading="lazy"
        @error="failedIconUrls.add(link.icon)"
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

  &__draggable-list {
    display: contents;

    &:deep(.draggable-list__item) {
      max-width: 100%;
      padding: 0.25rem;
      position: relative;
    }

    // D&D のドロップ先。ドロップ先の前に挿入されるため、前の隙間に縦線を表示する
    &:deep(.draggable-list__item:has(> [data-focused="true"]))::before {
      background-color: rgb(var(--fg-color));
      border-radius: 1px;
      content: "";
      position: absolute;
      top: 0.25rem;
      bottom: 0.25rem;
      left: -1px;
      width: 2px;
    }
  }

  // 編集モード
  // NOTICE: `grid-gap` の隙間ではドロップできないため、代わりに各項目の余白で隙間を作る
  &--edit {
    grid-gap: 0;
    margin: -0.25rem;

    & > .profile-link-list__add-button {
      margin: 0.25rem;
    }
  }

  &__item {
    --alpha: 0.875;
    background-color: rgb(var(--fg-color), 0.0625);
    border-radius: 1.5em;
    cursor: pointer;
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
    // NOTICE: 画像自体がドラッグされないよう、ポインターイベントを無効にする
    & > img {
      pointer-events: none;
      border-radius: var(--border-radius-middle);
      width: 1em;
      min-width: 1em;
      height: 1em;
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), var(--alpha));
      min-width: 1em;
    }

    // D&D ハンドル
    & > .svg-icon--drag {
      cursor: grab;
      fill: rgb(var(--fg-color), 0.5);
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

  // 追加ボタン（色を反転）
  &__add-button {
    background-color: rgb(var(--fg-color), var(--alpha));
    &:focus,
    &:hover {
      background-color: rgb(var(--fg-color), var(--alpha));
    }

    & > .svg-icon {
      fill: rgb(var(--bg-color));
    }

    & > span {
      color: rgb(var(--bg-color));
    }
  }
}
</style>
