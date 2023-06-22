<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AccountList from "@/components/AccountList.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const router = useRouter()

function close () {
  emit("close")
}

async function refreshSession () {
  if (!await mainState.openConfirmationPopup(
    $t("refreshSession"),
    $t("refreshSessionDescription")
  )) return
  mainState.processing = true
  if (!await mainState.atp.refreshSession())
    mainState.openErrorPopup("errorApiFailed", "AccountSettingsView/refreshSession")
  mainState.processing = false
}

async function newLogin () {
  close()
  mainState.processing = true
  mainState.atp.logout()
  await router.push({ name: "home" })
  location.reload()
  mainState.processing = false
}

async function logout () {
  close()
  mainState.processing = true
  try {
    await mainState.atp.deleteSession()
  } finally {
    mainState.atp.logout()
    await router.push({ name: "home" })
    location.reload()
    mainState.processing = false
  }
}
</script>

<template>
  <Popup
    class="account-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="person" />
        <span>{{ $t("account") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div class="account-popup__body">
        <div class="account-popup__button-container">
          <button
            class="button--bordered"
            @click.prevent="refreshSession()"
          >
            <span>{{ $t("refreshSession") }}</span>
          </button>
          <button
            class="button"
            @click.prevent="newLogin()"
          >
            <span>{{ $t("newLogin") }}</span>
          </button>
        </div>
        <AccountList :hasDeleteButton="true" />
        <button
          class="button--important"
          @click.prevent="logout"
        >
          <span>{{ $t("logout") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.account-popup {
  &__body {
    display: flex;
    flex-direction: column;
    grid-gap: 2rem;
  }

  &__button-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 0.5rem;
  }
}
</style>
