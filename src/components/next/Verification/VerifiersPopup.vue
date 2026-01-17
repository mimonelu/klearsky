<script lang="ts" setup>
import { inject, onBeforeMount, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  accounts: any[]
}>({
  processing: false,
  accounts: [],
})

onBeforeMount(async () => {
  await fetchVerifiers()
})

function onClickAccount (event: MouseEvent) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return
  }
  close()
}

function close () {
  emit("close")
}

async function fetchVerifiers () {
  Util.blurElement()
  if (
    state.processing ||
    mainState.verifiersPopupProps.verification == null
  ) {
    return
  }
  const dids = mainState.verifiersPopupProps.verification.verifications
    .map((verification) => verification.issuer)
  state.processing = true
  const response = await mainState.atp.fetchProfiles(dids)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "VerifiersPopup/fetchVerifiers")
    return
  }
  state.accounts.splice(0, state.accounts.length, ...response)
}
</script>

<template>
  <Popup
    class="verifiers-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="verifier" />
        <span>{{ $t("verifiers") }}</span>
        <template v-if="mainState.verifiersPopupProps.displayName">
          <span>-</span>
          <span>{{ mainState.verifiersPopupProps.displayName }}</span>
        </template>
      </h2>
    </template>
    <template #body>
      <div class="verifiers-popup__accounts">
        <Loader v-if="state.processing" />
        <UserBox
          v-for="account of state.accounts"
          :key="account.did"
          :user="account"
          :contentWarningDisabled="false"
          :menuDisplay="true"
          :viewerDisplay="true"
          @click="(event) => onClickAccount(event as MouseEvent)"
        />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.verifiers-popup {
  &:deep(.popup) {
    .popup-header {
      .svg-icon {
        --fg-color: var(--accent-color);
      }

      span:first-of-type {
        overflow: unset;
      }
    }

    .popup-body {
      padding: 0;
    }
  }

  &__accounts {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
  }

  .loader {
    padding: 0.5rem;
    position: unset;
  }

  .user-box {
    padding: 0.5rem 1rem;
  }
}
</style>
