<script lang="ts" setup>
import { inject, nextTick, reactive, ref } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

type TTFormMode = "oauthLogin" | "passwordLogin" | "signUp"

defineExpose({
  setHasAuthFactorToken,
})

const emit = defineEmits<{
  (
    event: "login" | "signUp",
    service: string,
    email: string,
    identifier: string,
    password: string,
    authFactorToken?: string,
    inviteCode?: string
  ): void
  (
    event: "oauthLogin",
    handle: string
  ): void
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const currentSession: undefined | TTSession =
  mainState.atp.data.sessions[mainState.atp.data.did]

const state = reactive<{
  formMode: TTFormMode
  hasAuthFactorToken: boolean
  service: string
  email: string
  identifier: string
  password: string
  authFactorToken?: string
  inviteCode?: string
}>({
  formMode: "oauthLogin",
  hasAuthFactorToken: false,
  service: currentSession?.__service ?? "",
  email: currentSession?.email ?? "",
  identifier: currentSession?.handle ?? "",
  password: "",
  authFactorToken: undefined,
  inviteCode: undefined,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitButtonLabel: $t(state.formMode),
  submitCallback,
  blurOnSubmit: true,
  data: [
    {
      display: state.formMode !== "oauthLogin",
      state,
      model: "service",
      label: $t("service"),
      type: "url",
      placeholder: "https://bsky.social",
      autocomplete: "url",
      inputmode: "url",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      display: state.formMode === "signUp",
      state,
      model: "email",
      label: $t("email"),
      type: "text",
      required: state.formMode === "signUp",
      autocomplete: "on",
      inputmode: "email",
      submitWhenEnter: true,
    },
    {
      state,
      model: "identifier",
      label: state.formMode === "signUp" ? $t("handle") : $t("identifier"),
      type: "text",
      required: true,
      autocomplete: "on",
      inputmode: "email",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      display: state.formMode !== "oauthLogin",
      state,
      model: "password",
      label: $t("password"),
      type: "password",
      required: state.formMode !== "oauthLogin",
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
      onInput: disableAuthFactorToken,
    },
    {
      display: state.formMode !== "signUp" && state.hasAuthFactorToken,
      state,
      model: "authFactorToken",
      label: $t("authFactorToken"),
      type: "password",
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
    },
    {
      display: state.formMode === "signUp",
      state,
      model: "inviteCode",
      label: $t("inviteCode"),
      type: "password",
      autocomplete: "off",
      inputmode: "text",
      submitWhenEnter: true,
    },
  ],
}

const easyForm = ref(null)

function setFormMode (mode: TTFormMode) {
  Util.blurElement()
  state.formMode = mode
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
  if (!state.hasAuthFactorToken) {
    return
  }
  state.authFactorToken = undefined
  state.hasAuthFactorToken = false
  updateEasyFormProps()
}

function updateEasyFormProps () {
  easyFormProps.data.forEach((data: TTEasyFormItem) => {
    switch (data.model) {
      case "service": {
        data.display = state.formMode !== "oauthLogin"
        break
      }
      case "email": {
        data.display = state.formMode === "signUp"
        data.required = data.display
        break
      }
      case "identifier": {
        data.label = state.formMode === "signUp" ? $t("handle") : $t("identifier")
        break
      }
      case "password": {
        data.display = state.formMode !== "oauthLogin"
        data.required = data.display
        break
      }
      case "authFactorToken": {
        data.display = state.formMode !== "signUp" && state.hasAuthFactorToken
        data.required = data.display
        break
      }
      case "inviteCode": {
        data.display = state.formMode === "signUp"
        break
      }
    }
  })
  ;(easyForm.value as any)?.forceUpdate()
}

function submitCallback () {
  if (state.formMode === "oauthLogin") {
    emit("oauthLogin", state.identifier)
  } else {
    emit(
      state.formMode === "signUp" ? "signUp" : "login",
      state.service || "https://bsky.social",
      state.email,
      state.identifier,
      state.password,
      state.authFactorToken?.trim(),
      state.inviteCode
    )
  }
}
</script>

<template>
  <div class="login-form">
    <EasyForm
      v-bind="easyFormProps"
      ref="easyForm"
    >
      <template #free-0>
        <div
          v-if="state.formMode === 'signUp'"
          class="textlabel"
        >
          <div class="textlabel__text--alert">
            <SVGIcon name="alert" />{{ $t("signUpCaution") }}
          </div>
        </div>
      </template>

      <!-- App Passwords 導線 -->
      <template #free-4>
        <a
          v-if="state.formMode !== 'oauthLogin'"
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
          v-if="state.formMode !== 'signUp' && state.hasAuthFactorToken"
          class="login-form__message"
        >{{ $t("authFactorTokenMessage") }}</p>
      </template>

      <template #after>
        <!-- OAuthログインボタン -->
        <button
          v-if="state.formMode === 'oauthLogin'"
          type="submit"
          class="button--accent"
        >
          <SVGIcon name="alphaACircle" />
          <span>{{ $t("oauthLogin") }}</span>
        </button>

        <!-- パスワードログインボタン -->
        <button
          v-else-if="state.formMode === 'passwordLogin'"
          type="submit"
          class="button"
        >
          <SVGIcon name="alphaPCircle" />
          <span>{{ $t("passwordLogin") }}</span>
        </button>

        <!-- サインアップボタン -->
        <button
          v-else
          type="submit"
          class="button--important"
        >
          <SVGIcon name="plus" />
          <span>{{ $t("signUp") }}</span>
        </button>

        <!-- フォームモードボタンコンテナ -->
        <div class="form-mode-button-container group-parts">
          <button
            v-if="state.formMode !== 'oauthLogin'"
            type="button"
            class="button--bordered"
            @click.prevent="setFormMode('oauthLogin')"
          >
            <span>{{ $t("oauthLogin") }}</span>
          </button>

          <button
            v-if="state.formMode !== 'passwordLogin'"
            type="button"
            class="button--bordered"
            @click.prevent="setFormMode('passwordLogin')"
          >
            <span>{{ $t("passwordLogin") }}</span>
          </button>

          <button
            v-if="state.formMode !== 'signUp'"
            type="button"
            class="button--bordered"
            @click.prevent="setFormMode('signUp')"
          >
            <span>{{ $t("signUpShort") }}</span>
          </button>
        </div>
      </template>
    </EasyForm>
  </div>
</template>

<style lang="scss" scoped>
.login-form {
  .easy-form:deep() {
    dt {
      color: rgb(var(--fg-color), 0.75);
    }
  }

  &__message {
    font-size: 0.875rem;
  }
}

.textlink--icon {
  font-size: 0.9375rem;
  font-weight: bold;
  margin-left: auto;
}

.form-mode-button-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;

  & > * {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
