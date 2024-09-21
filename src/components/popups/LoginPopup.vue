<script lang="ts" setup>
import { inject, nextTick, reactive, ref } from "vue"
import AccountList from "@/components/lists/AccountList.vue"
import Copyright from "@/components/labels/Copyright.vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Logo from "@/components/images/Logo.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineExpose({
  setHasAuthFactorToken,
})

const emit = defineEmits<{(
  event: string,
  service: string,
  email: string,
  identifier: string,
  password: string,
  authFactorToken?: string,
  inviteCode?: string
): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const currentSession: undefined | TTSession =
  mainState.atp.data.sessions[mainState.atp.data.did]

const state = reactive<{
  isSignUp: boolean
  hasAuthFactorToken: boolean
  service: string
  email: string
  identifier: string
  password: string
  authFactorToken?: string
  inviteCode?: string
}>({
  isSignUp: false,
  hasAuthFactorToken: false,
  service: currentSession?.__service ?? "https://bsky.social",
  email: currentSession?.email ?? "",
  identifier: currentSession?.handle ?? "",
  password: "",
  authFactorToken: undefined,
  inviteCode: undefined,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitButtonLabel: state.isSignUp ? $t("signUp") : $t("login"),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      state,
      model: "service",
      label: $t("service"),
      type: "url",
      required: true,
      placeholder: "https://bsky.social",
      autocomplete: "url",
      inputmode: "url",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      display: state.isSignUp,
      state,
      model: "email",
      label: $t("email"),
      type: "text",
      required: state.isSignUp,
      autocomplete: "on",
      inputmode: "email",
      submitWhenEnter: true,
    },
    {
      state,
      model: "identifier",
      label: state.isSignUp ? $t("handle") : $t("identifier"),
      type: "text",
      required: true,
      autocomplete: "on",
      inputmode: "email",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      state,
      model: "password",
      label: $t("password"),
      type: "password",
      required: true,
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      display: !state.isSignUp && state.hasAuthFactorToken,
      state,
      model: "authFactorToken",
      label: $t("authFactorToken"),
      type: "password",
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
    },
    {
      display: state.isSignUp,
      state,
      model: "inviteCode",
      label: $t("inviteCode"),
      type: "password",
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
    }
  ],
}

const easyForm = ref()

function toggleMode () {
  state.isSignUp = !state.isSignUp
  updateEasyFormProps()
}

async function setHasAuthFactorToken (value: boolean) {
  state.hasAuthFactorToken = value
  updateEasyFormProps()

  // 2FAのテキストボックスを自動フォーカス
  if (state.hasAuthFactorToken) {
    await nextTick()
    const authFactorTokenElement = window.document.querySelector("#easy-form--default__4") as null | HTMLElement
    authFactorTokenElement?.focus()
  }
}

function disableAuthFactorToken () {
  if (!state.hasAuthFactorToken) return
  state.authFactorToken = undefined
  state.hasAuthFactorToken = false
  updateEasyFormProps()
}

function updateEasyFormProps () {
  easyFormProps.submitButtonLabel = state.isSignUp ? $t("signUp") : $t("login")
  easyFormProps.data.forEach((data: TTEasyFormItem) => {
    switch (data.model) {
      case "email": {
        data.display = state.isSignUp
        data.required = state.isSignUp
        break
      }
      case "identifier": {
        data.label = state.isSignUp ? $t("handle") : $t("identifier")
        break
      }
      case "authFactorToken": {
        data.display = !state.isSignUp && state.hasAuthFactorToken
        data.required = data.display
        break
      }
      case "inviteCode": {
        data.display = state.isSignUp
        break
      }
    }
  })
  ;(easyForm.value as any)?.forceUpdate()
}

function submitCallback () {
  emit(
    state.isSignUp ? "signUp" : "login",
    state.service,
    state.email,
    state.identifier,
    state.password,
    state.authFactorToken?.trim(),
    state.inviteCode
  )
}
</script>

<template>
  <div class="login-popup">
    <div class="login-popup__inner">
      <div class="login-popup__header">
        <Logo />
        <div class="description">The web client for Bluesky.</div>
      </div>
      <div class="login-popup__body">
        <EasyForm
          v-bind="easyFormProps"
          ref="easyForm"
        >
          <!-- App Passwords 導線 -->
          <template #free-4>
            <a
              class="textlink--icon"
              href="https://bsky.app/settings/app-passwords"
              rel="noreferrer"
              target="_blank"
            >
              <SVGIcon name="cursorRight" />
              <span>{{ $t("getAppPassword") }}</span>
            </a>
          </template>

          <!-- 2FA - トークン要求メッセージ -->
          <template #free-5>
            <p
              v-if="!state.isSignUp && state.hasAuthFactorToken"
              class="login-popup__message"
            >{{ $t("authFactorTokenMessage") }}</p>
          </template>

          <template #after>
            <!-- サインインボタン -->
            <button
              v-if="!state.isSignUp"
              type="submit"
              class="button"
            >
              <span>{{ $t("login") }}</span>
            </button>

            <!-- サインアップボタン -->
            <button
              v-else
              type="submit"
              class="button--important"
            >
              <span>{{ $t("signUp") }}</span>
            </button>

            <!-- モードトグルボタン -->
            <a
              class="textlink--icon"
              @click.prevent="toggleMode"
            >
              <SVGIcon name="cursorRight" />
              <span>{{ state.isSignUp ? $t("login") : $t("signUp") }}</span>
            </a>
          </template>
        </EasyForm>
        <div class="account-container">
          <div class="account-header">{{ $t("myAccounts") }}</div>
          <AccountList :hasDeleteButton="false" />
        </div>
      </div>
      <Copyright />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$width: 768px;

.login-popup {
  background-color: rgb(var(--bg-color));
  display: flex;
  justify-content: center;
  min-height: 100vh;

  &__inner {
    display: grid;
    grid-template-rows: 1fr auto auto;
    flex-grow: 1;
    grid-gap: 2rem;
    padding-bottom: 4rem;
  }

  &__header {
    background-color: rgb(var(--bg-sub-color));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    grid-gap: 1rem;
    padding: 4rem 2rem;
  }

  &__body {
    grid-gap: 2rem;
    margin: 0 auto;
    padding: 0 2rem;
    width: $width;
    max-width: $width;

    // 縦長
    @media (max-width: $width) {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 576px;
    }

    // 横長
    @media not all and (max-width: $width) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: flex-start;
    }
  }

  &__message {
    font-size: 0.875rem;
  }
}

.logo {
  font-size: max(3.5rem, 6vmax);

  &:deep() {
    .version {
      font-size: 0.875rem;
    }
  }
}

.description {
  color: rgb(var(--fg-color), 0.75);
  font-size: 1.25rem;
}

.textlink--icon {
  font-size: 0.9375rem;
  font-weight: bold;
  margin-left: auto;
}

.account-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.75rem;
}

.account-header {
  font-weight: bold;
}

.copyright {
  font-size: 0.875rem;
  padding: 0 2rem;
  text-align: center;
}
</style>
