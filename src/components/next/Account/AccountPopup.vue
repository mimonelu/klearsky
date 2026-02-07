<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import AccountList from "@/components/next/Account/AccountList.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const router = useRouter()

function close () {
  emit("close")
}

function newLogin () {
  close()
  mainState.mounted = false
  mainState.mySession?.clearCurrentSession()
  window.scrollTo(0, 0)
  location.reload()
}

async function logout () {
  close()
  mainState.mounted = false

  // サーバー側セッション削除（エラーは無視）
  await mainState.mySession?.deleteSession()

  // カレントセッションを無効化（JWTクリア、アカウント履歴は残す）
  mainState.mySession?.invalidateCurrentSession()

  await router.push({ name: "home" })
  location.reload()
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
        <div class="account-popup__button-container group-parts">
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
        <AccountList :isAtLoginPopup="false" />
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
