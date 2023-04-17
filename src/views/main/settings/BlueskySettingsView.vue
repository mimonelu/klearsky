<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  sortedInviteCodes: ComputedRef<Array<TTInviteCode>>
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>
}>({
  sortedInviteCodes: computed(() => mainState.inviteCodes
    .sort((a: TTInviteCode, b: TTInviteCode) => {
      const aDate = new Date(a.createdAt)
      const bDate = new Date(b.createdAt)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })
  ),
  numberOfInviteCodes: computed(() => mainState.inviteCodes.length),
  numberOfAvailableInviteCodes: computed(() => mainState.inviteCodes
    .filter((inviteCode: TTInviteCode) => inviteCode.uses.length === 0)
    .length
  )
})

async function copyCode (code: string) {
  await navigator.clipboard.writeText(code)
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
          <div class="invite-code-container">
            <div
              v-for="inviteCode of state.sortedInviteCodes"
              :key="inviteCode.code"
              class="invite-code"
              :data-is-used="!!inviteCode.uses?.length"
            >
              <RouterLink
                v-if="!!inviteCode.uses?.length"
                :to="{
                  path: '/profile/post',
                  query: { handle: inviteCode.uses[0]?.usedBy }
                }"
                class="button--bordered"
              >
                <SVGIcon name="person" />
                <span class="invite-code__code">{{ inviteCode.code }}</span>
              </RouterLink>
              <button
                v-else
                class="button"
                @click.prevent="copyCode(inviteCode.code)"
              >
                <SVGIcon name="clipboard" />
                <span class="invite-code__code">{{ inviteCode.code }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.invite-code-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  padding-right: 0.5rem;
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 20rem;
  @include scroll-bar();
  @media not all and (min-width: $sp-width) {
    grid-template-columns: 1fr;
  }
}

.invite-code {
  display: flex;
  overflow: hidden;

  & > .button,
  & > .button--bordered {
    flex-grow: 1;
    justify-content: unset;
    overflow: hidden;

    & > span {
      line-height: 1.125;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
