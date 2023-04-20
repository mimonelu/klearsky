<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  sortedInviteCodes: ComputedRef<Array<TTInviteCode>>
}>({
  sortedInviteCodes: computed(() => mainState.inviteCodes
    .sort((a: TTInviteCode, b: TTInviteCode) => {
      const aDate = new Date(a.createdAt)
      const bDate = new Date(b.createdAt)
      return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
    })
  ),
})

function close () {
  emit("close")
}

async function copyCode (code: string) {
  await navigator.clipboard.writeText(code)
}
</script>

<template>
  <Popup
    class="invite-codes-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="inviteCode" />
        <span>{{ $t("inviteCodes") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div class="invite-code-container">
        <div
          v-for="inviteCode of state.sortedInviteCodes"
          :key="inviteCode.code"
          class="invite-code"
        >
          <div class="invite-code__code">
            <SVGIcon name="inviteCode" />
            <span>{{ inviteCode.code }}</span>
          </div>
          <div class="invite-code__slot-container">
            <div
              v-for="_number, index of inviteCode.available"
              :key="index"
              class="invite-code__slot"
            >
              <button
                v-if="inviteCode.uses[index] == null"
                class="button"
                @click.prevent="copyCode(inviteCode.code)"
              >
                <SVGIcon name="clipboard" />
                <span>{{ $t("copyInviteCode") }}</span>
              </button>
              <RouterLink
                v-else
                :to="{
                  path: '/profile/post',
                  query: { handle: inviteCode.uses[index]?.usedBy }
                }"
                class="button--bordered"
              >
                <SVGIcon name="person" />
                <span>{{ $t("userOfInviteCode") }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.invite-codes-popup:deep() {
  .popup {
    width: calc($router-view-width - 2rem);
    max-height: calc(100vh - 8rem);
  }
}

.invite-code-container {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1rem;
  @media not all and (min-width: $sp-width) {
    grid-template-columns: 1fr;

    .invite-code__code {
      padding: 0;
    }

    .invite-code__slot-container {
      flex-direction: column;
      flex-wrap: unset;
    }

    .invite-code__slot {
      width: 100%;
    }
  }
  @media (min-width: $sp-width) {
    .invite-code__slot-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}

.invite-code {
  display: contents;

  &__code {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    padding: calc(0.5rem + 1px) 0;

    & > .svg-icon {
      fill: rgb(var(--fg-color));
    }
  }

  &__slot-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    grid-gap: 0.5rem;
    position: relative;
  }

  .button,
  .button--bordered {
    flex-grow: 1;
    justify-content: unset;
    overflow: hidden;
    width: 100%;

    & > span {
      line-height: 1.125;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
