<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import InviteCodesPopup from "@/components/InviteCodesPopup.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  // 招待コード
  inviteCodesPopupDisplay: boolean
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>
}>({
  // 招待コード
  inviteCodesPopupDisplay: false,
  numberOfInviteCodes: computed(() => {
    let total = 0
    mainState.inviteCodes.forEach((inviteCode: TTInviteCode) => {
      total += inviteCode.available
    })
    return total
  }),
  numberOfAvailableInviteCodes: computed(() => {
    let total = 0
    mainState.inviteCodes.forEach((inviteCode: TTInviteCode) => {
      total += inviteCode.available - inviteCode.uses.length
    })
    return total
  }),
})

// 招待コード

function openInviteCodesPopup () {
  state.inviteCodesPopupDisplay = true
}

function closeInviteCodesPopup () {
  state.inviteCodesPopupDisplay = false
}
</script>

<template>
  <div class="klearsky-settings-view">
    <div class="settings-section-container">
      <!-- 招待コード -->
      <div class="settings-section">
        <div class="settings-section__header">
          <span>{{ $t("inviteCodes") }}</span>: <span class="numerator">{{ state.numberOfAvailableInviteCodes }}</span> / <span class="denominator">{{ state.numberOfInviteCodes }}</span>
        </div>
        <div class="settings-section__body">
          <button
            class="button"
            @click.prevent="openInviteCodesPopup"
          >{{ $t("confirmInviteCodes") }}</button>
        </div>
      </div>
    </div>

    <!-- 招待コードポップアップ -->
    <InviteCodesPopup
      v-if="state.inviteCodesPopupDisplay"
      @close="closeInviteCodesPopup"
     />
  </div>
</template>
