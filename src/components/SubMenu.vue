<script lang="ts" setup>
import Package from "@/../package.json"
import { inject } from "vue"
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function refreshSession () {
  if (!await mainState.openConfirmationPopup(
    $t("refreshSession"),
    $t("refreshSessionDescription")
  )) return
  mainState.processing = true
  if (!await mainState.atp.refreshSession())
    mainState.openErrorPopup("errorApiFailed", "SubMenu/refreshSession")
  mainState.processing = false
}
</script>

<template>
  <div class="sub-menu">
    <!-- ロゴ -->
    <Logo />

    <!-- @atproto/api バージョン -->
    <div class="api-version">@atproto/api v{{ Package.dependencies["@atproto/api"] }}</div>

    <!-- トリガーコンテナ -->
    <div class="textlink-container">
      <!-- 招待コード確認ポップアップトリガー -->
      <a
        v-if="mainState.numberOfAvailableInviteCodes > 0"
        class="textlink--icon"
        @click.prevent="mainState.openInviteCodesPopup"
      >
        <SVGIcon name="inviteCode" />
        <span>{{ mainState.numberOfAvailableInviteCodes }} {{ $t("inviteCodes") }}</span>
      </a>

      <!-- ミュート中のユーザーポップアップトリガー -->
      <a
        class="textlink--icon"
        @click.prevent="mainState.openMutingUsersPopup"
      >
        <SVGIcon name="volumeOff" />
        <span>{{ $t("mutingUsers") }}</span>
      </a>

      <!-- ブロック中のユーザーポップアップトリガー -->
      <a
        class="textlink--icon"
        @click.prevent="mainState.openBlockingUsersPopup"
      >
        <SVGIcon name="personOff" />
        <span>{{ $t("blockingUsers") }}</span>
      </a>

      <!-- セッション更新トリガー -->
      <a
        class="textlink--icon"
        @click.prevent="refreshSession"
      >
        <SVGIcon name="shimmer" />
        <span>{{ $t("refreshSession") }}</span>
      </a>
    </div>

    <!-- コピーライト -->
    <CopyRight />
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  padding: 3rem 1rem;
  position: relative;
}

// ロゴ
.logo {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

// @atproto/api バージョン
.api-version {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75rem;
  margin-bottom: 3rem;
  text-align: center;
}

// トリガーコンテナ
.textlink-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 1rem;
  font-size: 0.875rem;
  margin-bottom: 2rem;

  & > .textlink--icon:first-child > span {
    text-transform: lowercase;
  }
}

// コピーライト
.copyright {
  font-size: 0.875rem;
}
</style>
