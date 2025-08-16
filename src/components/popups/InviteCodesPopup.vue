<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  sortedInviteCodes: ComputedRef<Array<TTInviteCode>>
}>({
  // eslint-disable-next-line
  sortedInviteCodes: computed(() => mainState.inviteCodes
    .sort((a: TTInviteCode, b: TTInviteCode) => {
      const aDate = new Date(a.createdAt)
      const bDate = new Date(b.createdAt)
      return a.uses[0] != null && b.uses[0] == null
        ? - 1
        : a.uses[0] == null && b.uses[0] != null
          ? 1
          : (aDate < bDate ? 1 : aDate > bDate ? - 1 : 0)
    })
  ),
})

function close () {
  emit("close")
}

async function updateInviteCodes () {
  mainState.loaderDisplay = true
  const result = await mainState.updateInviteCodes()
  mainState.loaderDisplay = false

  // セッションキャッシュの更新
  if (result) mainState.myWorker!.setSessionCache("inviteCodes", mainState.inviteCodes)
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
        <!-- 更新ボタン -->
        <button
          type="button"
          class="button--bordered invite-codes-popup__update-button"
          @click.prevent="updateInviteCodes"
        >
          <SVGIcon name="refresh" />
        </button>

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
        class="invite-codes-popup__invite-code-container"
      >
        <template
          v-for="inviteCode of state.sortedInviteCodes"
          :key="inviteCode.code"
        >
          <div class="invite-code">
            <SVGIcon name="inviteCode" />
            <span>{{ inviteCode.code }}</span>
          </div>
          <div class="invite-code__button-container">
            <template
              v-for="_number, index of inviteCode.available"
              :key="index"
            >
              <!-- 未使用 -->
              <button
                v-if="inviteCode.uses[index] == null"
                type="button"
                class="button"
                @click.prevent="copyCode(inviteCode.code)"
              >
                <SVGIcon name="clipboard" />
                <span>{{ $t("copyInviteCode") }}</span>
              </button>

              <!-- 使用済み -->
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
                <span>{{ $t("userOfInviteCode") }} ({{ mainState.formatDate(inviteCode.createdAt) }})</span>
              </RouterLink>
            </template>
          </div>
        </template>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.invite-codes-popup {
  // 更新ボタン
  &__update-button {
    position: absolute;
    left: 0.5rem;
  }

  &__invite-code-container {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: auto 1fr;

    // SPレイアウト
    @include media-sp-layout() {
      grid-template-columns: 1fr;
    }

  }
}

.invite-code {
  display: flex;
  align-items: center;
  grid-gap: 0.5rem;

  & > .svg-icon {
    fill: rgb(var(--fg-color));
  }

  & > span {
    word-break: break-all;
  }

  &__button-container {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5rem;
    position: relative;

    .button,
    .button--bordered {
      flex-grow: 1;
      overflow: hidden;
      width: 100%;

      & > span {
        line-height: var(--line-height-low);
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
