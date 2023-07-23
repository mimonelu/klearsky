<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  text: string
}>({
  text: "",
})

const router = useRouter()

function searchKeyword () {
  router.push({ name: "keyword-search", query: { text: state.text } })
}

async function refreshSession () {
  if (!await mainState.openConfirmationPopup(
    $t("refreshSession"),
    $t("refreshSessionDescription")
  )) return
  mainState.processing = true
  if (!await mainState.atp.refreshSession())
    mainState.openErrorPopup("errorApiFailed", "SubMenu/refreshSession")
  else
    // セッションの同期
    mainState.broadcastChannel.postMessage({
      type: "refreshSession",
      data: JSON.parse(JSON.stringify(mainState.atp.session)),
    })
  mainState.processing = false
}
</script>

<template>
  <div class="sub-menu">
    <!-- ロゴ -->
    <Logo />

    <!-- ポスト検索ボックス -->
    <form @submit.prevent="searchKeyword">
      <input
        v-model="state.text"
        id="keyword-term-textbox"
        type="search"
        :placeholder="$t('searchWord')"
        autocapitalize="off"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="textbox"
      >
    </form>

    <!-- ショートカットプルダウン -->
    <div class="pulldown-button">
      <SVGIcon name="menu" />
      <span>{{ $t("shortcuts") }}</span>
      <menu>
        <!-- コンテンツ言語選択ポップアップトリガー -->
        <a @click.prevent="mainState.openContentLanguagesPopup">
          <SVGIcon name="translate" />
          <span>{{ $t("contentLanguages") }}</span>
        </a>

        <!-- ポスト言語選択ポップアップトリガー -->
        <a @click.prevent="mainState.openPostLanguagesPopup">
          <SVGIcon name="translate" />
          <span>{{ $t("postLanguages") }}</span>
        </a>

        <!-- マイフィードポップアップトリガー -->
        <a @click.prevent="mainState.openMyFeedsPopup">
          <SVGIcon name="feed" />
          <span>{{ $t("myFeeds") }}</span>
        </a>

        <!-- ワードミュートポップアップトリガー -->
        <a @click.prevent="mainState.openWordMutePopup">
          <SVGIcon name="alphabeticalOff" />
          <span>{{ $t("wordMute") }}</span>
        </a>

        <!-- コンテンツフィルタリングポップアップトリガー -->
        <a @click.prevent="mainState.openContentFilteringPopup">
          <SVGIcon name="alert" />
          <span>{{ $t("contentFiltering") }}</span>
        </a>

        <!-- ミュート中のユーザーポップアップトリガー -->
        <a @click.prevent="mainState.openMutingUsersPopup">
          <SVGIcon name="volumeOff" />
          <span>{{ $t("mutingUsers") }}</span>
        </a>

        <!-- ブロック中のユーザーポップアップトリガー -->
        <a @click.prevent="mainState.openBlockingUsersPopup">
          <SVGIcon name="personOff" />
          <span>{{ $t("blockingUsers") }}</span>
        </a>

        <!-- 招待コード確認ポップアップトリガー -->
        <a
          v-if="mainState.numberOfAvailableInviteCodes > 0"
          @click.prevent="mainState.openInviteCodesPopup"
        >
          <SVGIcon name="inviteCode" />
          <span>{{ mainState.numberOfAvailableInviteCodes }} {{ $t("inviteCodes") }}</span>
        </a>

        <!-- セッション更新トリガー -->
        <a @click.prevent="refreshSession">
          <SVGIcon name="shimmer" />
          <span>{{ $t("refreshSession") }}</span>
        </a>
      </menu>
    </div>

    <!-- コピーライト -->
    <CopyRight />
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  position: relative;
}

// ロゴ
.logo {
  font-size: 2rem;
  margin-bottom: 2rem;
}

// ポスト検索ボックス
.textbox {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  width: 100%;
}

// ショートカットプルダウン
.pulldown-button {
  margin-bottom: 2rem;
}

// コピーライト
.copyright {
  font-size: 0.875rem;
}
</style>
