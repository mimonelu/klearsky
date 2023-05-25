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
          >{{ $t("confirmInviteCodes") }}</button>
        </div>
      </div>

      <!-- ミュートユーザーリストポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("mutingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openMutingUsersPopup"
          >{{ $t("checkMutingUsers") }}</button>
        </div>
      </div>

      <!-- ブロックユーザーリストポップアップトリガー -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("blockingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="mainState.openBlockingUsersPopup"
          >{{ $t("checkBlockingUsers") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
