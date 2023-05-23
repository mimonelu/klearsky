<script lang="ts" setup>
import Package from "@/../package.json"
import { inject } from "vue"
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="sub-menu">
    <!-- ロゴ -->
    <Logo />

    <!-- @atproto/api バージョン -->
    <div class="api-version">@atproto/api v{{ Package.dependencies["@atproto/api"] }}</div>

    <!-- 招待コード確認ポップアップトリガー -->
    <div class="link-to-invite-code">
      <RouterLink
        v-if="mainState.numberOfAvailableInviteCodes > 0"
        class="textlink--icon"
        to="/settings/bluesky"
      >
        <SVGIcon name="inviteCode" />
        <span>{{ mainState.numberOfAvailableInviteCodes }} {{ $t("inviteCodes") }}</span>
      </RouterLink>
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

// 招待コード確認ポップアップトリガー
.link-to-invite-code {
  display: flex;
  justify-content: center;
  font-size: 0.875rem;
  margin-bottom: 2rem;

  & > span {
    text-transform: lowercase;
  }
}

// コピーライト
.copyright {
  font-size: 0.875rem;
}
</style>
