<script lang="ts" setup>
import { inject, reactive, ref } from "vue"
import AccountList from "@/components/list/AccountList.vue"
import Copyright from "@/components/shell-parts/Copyright.vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Logo from "@/components/shell-parts/Logo.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(
  event: string,
  service: string,
  email: string,
  identifier: string,
  password: string,
  inviteCode?: string
): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const currentSession: undefined | TTSession =
  mainState.atp.data.sessions[mainState.atp.data.did]

const state = reactive<{
  isSignUp: boolean
  service: string
  email: string
  identifier: string
  password: string
  inviteCode?: string
}>({
  isSignUp: false,
  service: currentSession?.__service ?? "https://bsky.social",
  email: currentSession?.email ?? "",
  identifier: currentSession?.handle ?? "",
  password: "",
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
    },
    {
      state,
      model: "identifier",
      label: state.isSignUp ? $t("handle") : $t("identifier"),
      type: "text",
      required: true,
      autocomplete: "on",
      inputmode: "email",
    },
    {
      state,
      model: "password",
      label: $t("password"),
      type: "password",
      required: true,
      autocomplete: "off",
      inputmode: "text",
    },
    {
      display: state.isSignUp,
      state,
      model: "inviteCode",
      label: $t("inviteCode"),
      type: "password",
      autocomplete: "off",
      inputmode: "text",
    }
  ],
}

const easyForm = ref()

function toggleMode () {
  state.isSignUp = !state.isSignUp
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
      case "inviteCode": {
        data.display = state.isSignUp
        break
      }
    }
  })
  ;(easyForm.value as any)?.forceUpdate()
}

function submitCallback () {
  emit(state.isSignUp ? "signUp" : "login", state.service, state.email, state.identifier, state.password, state.inviteCode)
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
  background-color: var(--fg-color-00625);
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
    background-color: rgb(var(--bg-color));
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
  color: var(--fg-color-075);
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
