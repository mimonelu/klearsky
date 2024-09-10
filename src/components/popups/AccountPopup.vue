<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AccountList from "@/components/lists/AccountList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const router = useRouter()

function close () {
  emit("close")
}

async function newLogin () {
  close()
  mainState.loaderDisplay = true
  mainState.atp.logout()
  await router.push({ name: "home" })
  location.reload()
  mainState.loaderDisplay = false
}

async function logout () {
  close()
  mainState.loaderDisplay = true
  const response = await mainState.atp.deleteSession()
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "AccountPopup/logout")
    await Util.waitProp(() => mainState.errorPopupProps.display, false)
  }
  mainState.atp.logout()
  await router.push({ name: "home" })
  location.reload()
  mainState.loaderDisplay = false
}
</script>

<template>
  <Popup
    class="account-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="person" />
        <span>{{ $t("myAccounts") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="account-popup__body">
        <div class="account-popup__button-container group-buttons">
          <!-- 新規ログインボタン -->
          <button
            class="button"
            @click.prevent="newLogin()"
          >
            <span>{{ $t("newLogin") }}</span>
          </button>

          <!-- ログアウトボタン -->
          <button
            class="button--important"
            @click.prevent="logout"
          >
            <span>{{ $t("logout") }}</span>
          </button>
        </div>

        <!-- アカウントリスト -->
        <AccountList :hasDeleteButton="true" />
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.account-popup {
  &__body {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }

  &__button-container > button {
    flex-grow: 1;
  }
}
</style>
