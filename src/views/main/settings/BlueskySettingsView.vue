<script lang="ts" setup>
import { inject } from "vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="klearsky-settings-view">
    <div class="settings-section-container">
      <!-- 招待コード確認ポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">
          <span>{{ $t("inviteCodes") }}</span>: <span class="numerator">{{ mainState.numberOfAvailableInviteCodes }}</span> / <span class="denominator">{{ mainState.numberOfInviteCodes }}</span>
        </div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openInviteCodesPopup"
          >
            <span>{{ $t("confirmInviteCodes") }}</span>
          </button>
        </div>
      </div>

      <!-- コンテンツフィルタリングポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("contentFiltering") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openContentFilteringPopup"
          >
            <span>{{ $t("modifyContentFiltering") }}</span>
          </button>
        </div>
      </div>

      <!-- ミュートユーザーリストポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("mutingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openMutingUsersPopup"
          >
            <span>{{ $t("checkMutingUsers") }}</span>
          </button>
        </div>
      </div>

      <!-- ブロックユーザーリストポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("blockingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openBlockingUsersPopup"
          >
            <span>{{ $t("checkBlockingUsers") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
