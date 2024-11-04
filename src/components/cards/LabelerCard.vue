<script lang="ts" setup>
import { inject, reactive } from "vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelerSettingsPopupTrigger from "@/components/buttons/LabelerSettingsPopupTrigger.vue"
import LabelerSubscribeToggle from "@/components/buttons/LabelerSubscribeToggle.vue"
import LazyImage from "@/components/images/LazyImage.vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import ViewerLabels from "@/components/labels/ViewerLabels.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(name: string): void}>()

const props = defineProps<{
  labeler: TILabeler
  menuDisplay: boolean
  detailDisplay: boolean
  subscribeButtonDisplay: boolean
  settingsButtonDisplay: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  loaderDisplay: boolean
  detailDisplay: boolean
  isProfileFeedsPage: boolean
}>({
  loaderDisplay: false,
  detailDisplay: props.detailDisplay,
  isProfileFeedsPage:
    mainState.currentPath === "/profile/feeds" &&
    mainState.currentQuery.account === props.labeler.creator.did,
})

function toggleDetailDisplay () {
  Util.blurElement()
  state.detailDisplay = !state.detailDisplay
}

async function toggleLike () {
  Util.blurElement()
  if (state.loaderDisplay) {
    return
  }
  if (mainState.myLabeler == null) {
    return
  }
  if (props.labeler.viewer?.like == null) {
    state.loaderDisplay = true
    const response = await mainState.myLabeler.like(
      props.labeler.uri,
      props.labeler.cid
    )
    state.loaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "LabelerCard/toggleLike")
      return
    }
  } else {
    state.loaderDisplay = true
    const response = await mainState.myLabeler.unlike(
      props.labeler.uri,
      props.labeler.viewer.like
    )
    state.loaderDisplay = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "LabelerCard/toggleLike")
      return
    }
  }

  // TODO: 要リファクタリング
  // LabelerCard に渡される labeler は mainState.currentLabeler であり、
  // MyLabeler で管理しているラベラーの参照ではない
  // 両者の整合性を維持するため、別途 mainState.currentLabeler を更新している
  if (mainState.currentLabeler != null) {
    const labeler = mainState.myLabeler.labelers.find((labeler) => {
      return labeler.uri === props.labeler.uri
    })
    if (labeler == null) {
      return
    }
    mainState.currentLabeler.likeCount = labeler.likeCount
    mainState.currentLabeler.viewer = labeler.viewer
  }
}

function openProfilePopover ($event: Event) {
  Util.blurElement()
  mainState.profilePopoverProps.isUser = props.labeler.creator.did === mainState.atp.data.did
  mainState.profilePopoverProps.user = props.labeler.creator
  mainState.profilePopoverFrom = "labeler-card"
  mainState.openProfilePopover($event.target)
}
</script>

<template>
  <div
    class="labeler-card"
    @click.stop
  >
    <!-- Viewer ラベル -->
    <ViewerLabels :viewer="labeler.creator.viewer" />

    <div class="labeler-card__content">
      <!-- ラベラー画像 -->
      <LazyImage :src="labeler.creator.avatar" />

      <!-- ラベラー名 -->
      <div class="labeler-card__display-name">
        <button
          type="button"
          @click.prevent.stop="toggleDetailDisplay"
        >
          <SVGIcon :name="state.detailDisplay ? 'cursorDown' : 'cursorUp'" />
          <span>{{ labeler.creator.displayName || labeler.creator.handle }}</span>
        </button>
      </div>

      <!-- ラベラーライクボタン -->
      <button
        type="button"
        class="labeler-card__like-count"
        :data-on="props.labeler.viewer?.like != null"
        @click.prevent.stop="toggleLike"
      >
        <SVGIcon name="like" />
        <span>{{ labeler.likeCount }}</span>
      </button>

      <!-- ラベラー作成日時 -->
      <div class="labeler-card__indexed-at">
        <SVGIcon name="clock" />
        <span>{{ mainState.formatDate(labeler.indexedAt) }}</span>
      </div>

      <!-- 公式マーカー -->
      <div
        v-if="labeler.creator.did === CONSTS.OFFICIAL_LABELER_DID"
        class="labeler-card__official-marker"
      >
        <SVGIcon name="bluesky" />
        <span>{{ $t("official") }}</span>
      </div>

      <!-- プロフィールポップオーバートリガー -->
      <button
        v-if="menuDisplay"
        class="labeler-card__menu-button"
        @click.prevent.stop="openProfilePopover"
      >
        <SVGIcon name="menu" />
      </button>
    </div>

    <div v-if="state.detailDisplay">
      <!-- ラベラー説明文 -->
      <HtmlText
        class="labeler-card__description"
        dir="auto"
        :text="labeler.creator.description ?? '&emsp;'"
        @onActivateMention="emit('onActivateMention')"
        @onActivateHashTag="emit('onActivateHashTag')"
      />
    </div>

    <!-- ボタンコンテナ -->
    <div
      v-if="menuDisplay"
      class="labeler-card__button-container group-buttons"
    >
      <!-- ラベラーサブスクライブトグル -->
      <LabelerSubscribeToggle
        v-if="subscribeButtonDisplay"
        :labeler="labeler"
        @subscribed="emit('subscribed')"
        @unsubscribed="emit('unsubscribed')"
      />

      <!-- プロフィールリンクボタン -->
      <RouterLink
        :class="state.isProfileFeedsPage ? 'button--plane' : 'button--bordered'"
        class="labeler-card__profile-button"
        :to="{
          path: '/profile/feeds',
          query: { account: labeler.creator.did },
        }"
        @click.prevent="$emit('close')"
      >
        <SVGIcon name="labeler" />
        <span>{{ $t("profile") }}</span>
      </RouterLink>

      <!-- ラベラー設定ポップアップトリガー -->
      <LabelerSettingsPopupTrigger
        v-if="settingsButtonDisplay"
        :labeler="labeler"
      />
    </div>

    <Loader
      v-if="state.loaderDisplay"
      @click.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.labeler-card {
  cursor: default;
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;
  position: relative;

  // Viewer ラベル
  .viewer-labels {
    font-size: 0.75rem;
    &:empty {
      display: contents;
    }
  }

  &__content {
    display: grid;
    grid-gap: 0 0.75em;
    grid-template-columns: auto auto auto 1fr auto;
    grid-template-areas:
      "a n n n m"
      "a l i o m";
    align-items: flex-start;
  }

  // ラベラー画像
  .lazy-image {
    grid-area: a;
    border-radius: var(--border-radius-middle);
    display: block;
    overflow: hidden;
    min-width: 3em;
    max-width: 3em;
    min-height: 3em;
    max-height: 3em;
  }

  // ラベラー名
  &__display-name {
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

      & > span {
        font-weight: bold;
        line-height: var(--line-height-low);
        word-break: break-word;
      }
      &:focus, &:hover {
        & > span {
          text-decoration: underline;
          text-underline-offset: 0.25em;
        }
      }
    }
  }

  // ラベラーライクボタン
  // ラベラー作成日時
  // 公式マーカー
  &__like-count,
  &__indexed-at,
  &__official-marker {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    grid-gap: 0.375em;
    line-height: var(--line-height-low);

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

  // ラベラーライクボタン
  &__like-count {
    --color: rgb(var(--fg-color), 0.5);
    grid-area: l;
    cursor: pointer;
    margin: -0.5em;
    padding: 0.5em;
    &[data-on="true"] {
      --color: rgb(var(--like-color), 0.75);
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

  // ラベラー作成日時
  &__indexed-at {
    grid-area: i;
    color: rgb(var(--fg-color), 0.5);

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
    }
  }

  // 公式マーカー
  &__official-marker {
    grid-area: o;
    color: rgb(var(--label-color));
    font-weight: bold;

    & > .svg-icon {
      fill: rgb(var(--label-color));
    }
  }

  // ラベラーカードメニュートリガー
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

  // ラベラー説明文
  &__description {
    color: rgb(var(--fg-color));
    font-size: 0.875em;
    line-height: var(--line-height-high);
    white-space: pre-wrap;
    word-break: break-word;
  }

  // ボタンコンテナ
  &__button-container {
    justify-content: flex-end;
  }

  // ラベラーサブスクライブトグル
  .labeler-subscribe-toggle {
    font-size: 0.875em;
  }

  // プロフィールリンクボタン
  &__profile-button {
    font-size: 0.875em;
    &.button--plane {
      background-color: rgb(var(--accent-color), 0.25);
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

  // ラベラー設定ポップアップトリガー
  .labeler-settings-popup-trigger {
    font-size: 0.875em;
  }
}
</style>
