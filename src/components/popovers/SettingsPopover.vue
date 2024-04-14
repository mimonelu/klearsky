<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

const mainState = inject("state") as MainState

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
      }
      : {
        positionX: "center",
        positionY: "top",
        directionX: "center",
        directionY: "up",
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
    case "myTag": {
      mainState.openMyTagPopup({ mode: 'edit' }) 
      break
    }
    case "contentFiltering": {
      mainState.openContentFilteringPopup() 
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
    case "psySafety": {
      mainState.openPsySafetySettingsPopup()
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
    :data-direction="mainState.settingsPopoverDirection"
    @close="close"
  >
    <menu class="list-menu">
      <!-- UI言語選択ポップアップトリガー -->
      <a @click.prevent="process('uiLanguage')">
        <SVGIcon name="translate" />
        <span>{{ $t("uiLanguage") }}</span>
      </a>

      <!-- コンテンツ言語選択ポップアップトリガー -->
      <a @click.prevent="process('contentLanguages')">
        <SVGIcon name="translate" />
        <span>{{ $t("contentLanguages") }}</span>
      </a>

      <!-- ポスト言語選択ポップアップトリガー -->
      <a @click.prevent="process('postLanguages')">
        <SVGIcon name="translate" />
        <span>{{ $t("postLanguages") }}</span>
      </a>

      <!-- マイフィードポップアップトリガー -->
      <a @click.prevent="process('myFeeds')">
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </a>

      <!-- マイリストポップアップトリガー -->
      <a @click.prevent="process('myList')">
        <SVGIcon name="list" />
        <span>{{ $t("myList") }}</span>
      </a>

      <!-- マイタグポップアップトリガー -->
      <a @click.prevent="process('myTag')">
        <SVGIcon name="tag" />
        <span>{{ $t("myTag") }}</span>
      </a>

      <hr />

      <!-- コンテンツフィルタリングポップアップトリガー -->
      <a @click.prevent="process('contentFiltering')">
        <SVGIcon name="contentFiltering" />
        <span>{{ $t("contentFiltering") }}</span>
      </a>

      <!-- ミュート中のユーザーポップアップトリガー -->
      <a @click.prevent="process('mutingUsers')">
        <SVGIcon name="volumeOff" />
        <span>{{ $t("mutingUsers") }}</span>
      </a>

      <!-- ブロック中のユーザーポップアップトリガー -->
      <a @click.prevent="process('blockingUsers')">
        <SVGIcon name="personOff" />
        <span>{{ $t("blockingUsers") }}</span>
      </a>

      <!-- ワードミュートポップアップトリガー -->
      <a @click.prevent="process('wordMute')">
        <SVGIcon name="wordMute" />
        <span>{{ $t("wordMute") }}</span>
      </a>

      <hr />

      <!-- デザイン設定ポップアップトリガー -->
      <a @click.prevent="process('design')">
        <SVGIcon name="palette" />
        <span>{{ $t("designSettings") }}</span>
      </a>

      <!-- ポスト設定ポップアップトリガー -->
      <a @click.prevent="process('post')">
        <SVGIcon name="post" />
        <span>{{ $t("postSettings") }}</span>
      </a>

      <!-- 心理的安全性設定ポップアップトリガー -->
      <a @click.prevent="process('psySafety')">
        <SVGIcon name="like" />
        <span>{{ $t("psySafetySettings") }}</span>
      </a>

      <!-- その他設定ポップアップトリガー -->
      <a @click.prevent="process('etc')">
        <SVGIcon name="shimmer" />
        <span>{{ $t("etcSettings") }}</span>
      </a>

      <template v-if="mainState.numberOfAvailableInviteCodes > 0">
        <hr />

        <!-- 招待コード確認ポップアップトリガー -->
        <a @click.prevent="process('inviteCode')">
          <SVGIcon name="inviteCode" />
          <span>{{ $t("inviteCodes") }} ({{ mainState.numberOfAvailableInviteCodes }} / {{ mainState.numberOfInviteCodes }})</span>
        </a>
      </template>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.settings-popover {
  &[data-direction="toRight"]:deep() {
    .popover__content {
      margin-left: 0.5rem;
    }
  }
  &[data-direction="toUp"]:deep() {
    .popover__content {
      margin-top: -0.5rem;
    }
  }
}
</style>
