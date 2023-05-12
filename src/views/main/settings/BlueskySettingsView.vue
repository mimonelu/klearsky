<script lang="ts" setup>
import { inject, reactive } from "vue"
import BlockingUsersPopup from "@/components/BlockingUsersPopup.vue"
import InviteCodesPopup from "@/components/InviteCodesPopup.vue"
import MutingUsersPopup from "@/components/MutingUsersPopup.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  // 招待コード
  inviteCodesPopupDisplay: boolean

  // ミュート中のユーザーポップアップ
  mutingUsersPopupDisplay: boolean

  // ブロック中のユーザーポップアップ
  blockingUsersPopupDisplay: boolean
}>({
  // 招待コード
  inviteCodesPopupDisplay: false,

  // ミュート中のユーザーポップアップ
  mutingUsersPopupDisplay: false,

  // ブロック中のユーザーポップアップ
  blockingUsersPopupDisplay: false,
})

// 招待コード

function openInviteCodesPopup () {
  state.inviteCodesPopupDisplay = true
}

function closeInviteCodesPopup () {
  state.inviteCodesPopupDisplay = false
}

// ミュート中のユーザー

function openMutingUsersPopup () {
  state.mutingUsersPopupDisplay = true
}

function closeMutingUsersPopup () {
  state.mutingUsersPopupDisplay = false
}

// ブロック中のユーザー

function openBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = true
}

function closeBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = false
}
</script>

<template>
  <div class="klearsky-settings-view">
    <div class="settings-section-container">
      <!-- 招待コード -->
      <div class="settings-section">
        <div class="settings-section__header">
          <span>{{ $t("inviteCodes") }}</span>: <span class="numerator">{{ mainState.numberOfAvailableInviteCodes }}</span> / <span class="denominator">{{ mainState.numberOfInviteCodes }}</span>
        </div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="openInviteCodesPopup"
          >{{ $t("confirmInviteCodes") }}</button>
        </div>
      </div>

      <!-- ミュート中のユーザーリスト -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("mutingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="openMutingUsersPopup"
          >{{ $t("checkMutingUsers") }}</button>
        </div>
      </div>

      <!-- ブロック中のユーザーリスト -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("blockingUsers") }}</div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="openBlockingUsersPopup"
          >{{ $t("checkBlockingUsers") }}</button>
        </div>
      </div>
    </div>

    <!-- 招待コードポップアップ -->
    <InviteCodesPopup
      v-if="state.inviteCodesPopupDisplay"
      @close="closeInviteCodesPopup"
     />

    <!-- ミュート中のユーザーポップアップ -->
    <MutingUsersPopup
      v-if="state.mutingUsersPopupDisplay"
      @close="closeMutingUsersPopup"
     />

    <!-- ブロック中のユーザーポップアップ -->
    <BlockingUsersPopup
      v-if="state.blockingUsersPopupDisplay"
      @close="closeBlockingUsersPopup"
     />
  </div>
</template>
