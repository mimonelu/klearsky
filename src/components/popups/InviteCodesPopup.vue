<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

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
    <template #header>
      <h2>
        <SVGIcon name="inviteCode" />
        <span>{{ $t("inviteCodes") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 招待コードがない場合 -->
      <div
        v-if="state.sortedInviteCodes.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noInviteCodes") }}
        </div>
      </div>

      <!-- 招待コードがある場合 -->
      <div
        v-else
        class="invite-code-container"
      >
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
                  path: '/profile/feeds',
                  query: { account: inviteCode.uses[index]?.usedBy }
                }"
                class="button--bordered"
                @click="close"
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
.invite-code-container {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1rem;

  // SP幅以上
  @media (min-width: $sp-width) {
    .invite-code__slot-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  // SP幅未満
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

    & > span {
      word-break: break-word;
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
