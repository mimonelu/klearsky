<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  numberOfContentLanguages: ComputedRef<number>
  numberOfPostLanguages: ComputedRef<number>
}>({
  numberOfContentLanguages: computed((): number => {
    return mainState.currentSetting.contentLanguages?.length ?? 0
  }),
  numberOfPostLanguages: computed((): number => {
    return mainState.currentSetting.postLanguages?.length ?? 0
  }),
})

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.settingsPopoverSelector,
    mainState.settingsPopoverDirection === "toRight"
      ? {
        positionX: "right",
        positionY: "middle",
        directionX: "right",
        directionY: "middle",
        collideX: true,
        collideY: true,
        animationDirection: "right",
      }
      : {
        positionX: "center",
        positionY: "top",
        directionX: "center",
        directionY: "up",
        collideX: true,
        collideY: true,
        animationDirection: "up",
      }
  )
}

function close () {
  emit("close")
}

function process (type: string) {
  Util.blurElement()
  switch (type) {
    case "uiLanguage": {
      mainState.openUiLanguageSettingsPopup()
      break
    }
    case "contentLanguages": {
      mainState.openContentLanguagesPopup()
      break
    }
    case "postLanguages": {
      mainState.openPostLanguagesPopup()
      break
    }
    case "myFeeds": {
      mainState.openMyFeedsPopup()
      break
    }
    case "myList": {
      mainState.openMyListPopup()
      break
    }
    case "myLabeler": {
      mainState.openLabelerListPopup("myLabeler", mainState.myLabeler!.labelers)
      break
    }
    case "myWord": {
      mainState.openMyWordPopup({ mode: 'edit' })
      break
    }
    case "customBookmark": {
      mainState.openCustomBookmarkPopup()
      break
    }
    case "mutingUsers": {
      mainState.openMutingUsersPopup()
      break
    }
    case "blockingUsers": {
      mainState.openBlockingUsersPopup()
      break
    }
    case "wordMute": {
      mainState.openWordMutePopup()
      break
    }
    case "design": {
      mainState.openDesignSettingsPopup()
      break
    }
    case "post": {
      mainState.openPostSettingsPopup()
      break
    }
    case "time": {
      mainState.openTimeSettingsPopup()
      break
    }
    case "etc": {
      mainState.openOtherSettingsPopup()
      break
    }
    case "inviteCode": {
      mainState.openInviteCodesPopup()
      break
    }
  }
  close()
}
</script>

<template>
  <Popover
    class="settings-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <!-- UI言語選択ポップアップトリガー -->
      <button
        type="button"
        data-type="uiLanguage"
        @click.prevent="process('uiLanguage')"
      >
        <SVGIcon name="translate" />
        <span>{{ $t("uiLanguage") }}</span>
      </button>

      <!-- コンテンツ言語選択ポップアップトリガー -->
      <button
        type="button"
        data-type="contentLanguages"
        @click.prevent="process('contentLanguages')"
      >
        <SVGIcon name="translate" />
        <span>{{ $t("contentLanguages") }}</span>
        <span v-if="state.numberOfContentLanguages > 0">({{ state.numberOfContentLanguages }})</span>
      </button>

      <!-- ポスト言語選択ポップアップトリガー -->
      <button
        type="button"
        data-type="postLanguages"
        @click.prevent="process('postLanguages')"
      >
        <SVGIcon name="translate" />
        <span>{{ $t("postLanguages") }}</span>
        <span v-if="state.numberOfPostLanguages > 0">({{ state.numberOfPostLanguages }})</span>
      </button>

      <!-- マイフィードポップアップトリガー -->
      <button
        type="button"
        data-type="myFeeds"
        @click.prevent="process('myFeeds')"
      >
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </button>

      <!-- マイリストポップアップトリガー -->
      <button
        type="button"
        data-type="myList"
        @click.prevent="process('myList')"
      >
        <SVGIcon name="list" />
        <span>{{ $t("myList") }}</span>
      </button>

      <!-- マイラベラーポップアップトリガー -->
      <button
        type="button"
        data-type="myLabeler"
        @click.prevent="process('myLabeler')"
      >
        <SVGIcon name="labeler" />
        <span>{{ $t("myLabeler") }}</span>
      </button>

      <!-- マイワードポップアップトリガー -->
      <button
        type="button"
        data-type="myWord"
        @click.prevent="process('myWord')"
      >
        <SVGIcon name="alphaA" />
        <span>{{ $t("myWord") }}</span>
      </button>

      <!-- カスタムブックマークポップアップトリガー -->
      <button
        type="button"
        data-type="customBookmark"
        @click.prevent="process('customBookmark')"
      >
        <SVGIcon name="bookmark" />
        <span>{{ $t("customBookmark") }}</span>
      </button>

      <hr />

      <!-- ミュート中のユーザーポップアップトリガー -->
      <button
        type="button"
        data-type="mutingUsers"
        @click.prevent="process('mutingUsers')"
      >
        <SVGIcon name="volumeOff" />
        <span>{{ $t("mutingUsers") }}</span>
      </button>

      <!-- ブロック中のユーザーポップアップトリガー -->
      <button
        type="button"
        data-type="blockingUsers"
        @click.prevent="process('blockingUsers')"
      >
        <SVGIcon name="personOff" />
        <span>{{ $t("blockingUsers") }}</span>
      </button>

      <!-- ワードミュートポップアップトリガー -->
      <button
        type="button"
        data-type="wordMute"
        @click.prevent="process('wordMute')"
      >
        <SVGIcon name="wordMute" />
        <span>{{ $t("wordMute") }}</span>
      </button>

      <hr />

      <!-- デザイン設定ポップアップトリガー -->
      <button
        type="button"
        data-type="design"
        @click.prevent="process('design')"
      >
        <SVGIcon name="palette" />
        <span>{{ $t("designSettings") }}</span>
      </button>

      <!-- ポスト設定ポップアップトリガー -->
      <button
        type="button"
        data-type="post"
        @click.prevent="process('post')"
      >
        <SVGIcon name="post" />
        <span>{{ $t("postSettings") }}</span>
      </button>

      <!-- 時間設定ポップアップトリガー -->
      <button
        type="button"
        data-type="time"
        @click.prevent="process('time')"
      >
        <SVGIcon name="clock" />
        <span>{{ $t("timeSettings") }}</span>
      </button>

      <!-- その他設定ポップアップトリガー -->
      <button
        type="button"
        data-type="etc"
        @click.prevent="process('etc')"
      >
        <SVGIcon name="shimmer" />
        <span>{{ $t("etcSettings") }}</span>
      </button>

      <template v-if="mainState.numberOfAvailableInviteCodes > 0">
        <hr />

        <!-- 招待コード確認ポップアップトリガー -->
        <button
          type="button"
          data-type="inviteCode"
          @click.prevent="process('inviteCode')"
        >
          <SVGIcon name="inviteCode" />
          <span>{{ $t("inviteCodes") }} ({{ mainState.numberOfAvailableInviteCodes }} / {{ mainState.numberOfInviteCodes }})</span>
        </button>
      </template>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.settings-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }

  button > .svg-icon {
    --icon-color: var(--fg-color);
    fill: rgb(var(--icon-color), 0.75);
  }
  button[data-type="uiLanguage"] > .svg-icon { /**/ }
  button[data-type="contentLanguages"] > .svg-icon { /**/ }
  button[data-type="postLanguages"] > .svg-icon { /**/ }
  button[data-type="myFeeds"] > .svg-icon { --icon-color: var(--feed-color); }
  button[data-type="myList"] > .svg-icon { --icon-color: var(--list-color); }
  button[data-type="myWord"] > .svg-icon { /**/ }
  button[data-type="myLabeler"] > .svg-icon { --icon-color: var(--label-color); }
  button[data-type="customBookmark"] > .svg-icon { --icon-color: var(--post-color); }
  button[data-type="mutingUsers"] > .svg-icon { --icon-color: var(--notice-color); }
  button[data-type="blockingUsers"] > .svg-icon { --icon-color: var(--notice-color); }
  button[data-type="wordMute"] > .svg-icon { --icon-color: var(--notice-color); }
  button[data-type="design"] > .svg-icon { /**/ }
  button[data-type="post"] > .svg-icon { --icon-color: var(--post-color); }
  button[data-type="time"] > .svg-icon { /**/ }
  button[data-type="etc"] > .svg-icon { /**/ }
  button[data-type="inviteCode"] > .svg-icon { /**/ }
}
</style>
