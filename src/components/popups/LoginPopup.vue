<script lang="ts" setup>
import { inject, reactive } from "vue"
import AccountList from "@/components/list/AccountList.vue"
import Copyright from "@/components/shell-parts/Copyright.vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Logo from "@/components/shell-parts/Logo.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(
  event: string,
  service: string,
  identifier: string,
  password: string
): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const currentSession: undefined | TTSession =
  mainState.atp.data.sessions[mainState.atp.data.did]

const state = reactive<{
  service: string
  identifier: string
  password: string
}>({
  service: currentSession?.__service ?? "https://bsky.social",
  identifier: currentSession?.handle ?? "",
  password: ""
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("login"),
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
      state,
      model: "identifier",
      label: $t("identifier"),
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
    }
  ],
}

function submitCallback () {
  emit("login", state.service, state.identifier, state.password)
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
        <EasyForm v-bind="easyFormProps">
          <!-- App Passwords 導線 -->
          <template #after>
            <a
              class="textlink--icon app-password-link"
              href="https://bsky.app/settings/app-passwords"
              rel="noreferrer"
              target="_blank"
            >
              <SVGIcon name="cursorRight" />
              <span>{{ $t("getAppPassword") }}</span>
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

.app-password-link {
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
