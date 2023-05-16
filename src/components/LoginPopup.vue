<script lang="ts" setup>
import { inject, reactive } from "vue"
import AccountList from "@/components/AccountList.vue"
import Copyright from "@/components/Copyright.vue"
import EasyForm from "@/components/EasyForm.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

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
      placeholder: "your@email.address, you.bsky.social, did:plc:xxx...",
      autocomplete: "on",
      inputmode: "email",
      focus: currentSession == null,
    },
    {
      state,
      model: "password",
      label: $t("password"),
      type: "password",
      required: true,
      autocomplete: "off",
      inputmode: "text",
      focus: currentSession != null,
    }
  ],
}

async function submitCallback () {
  emit("login", state.service, state.identifier, state.password)
}
</script>

<template>
  <div
    class="login-popup"
    :data-has-accounts="Object.keys(mainState.atp.data.sessions).length > 0"
  >
    <div class="login-popup__inner">
      <div class="login-popup__header">
        <Logo />
        <div class="description">The web client for Bluesky.</div>
      </div>
      <div class="login-popup__body">
        <EasyForm v-bind="easyFormProps">
          <!-- App Passwords 導線 -->
          <template v-slot:after>
            <a
              class="textlink--icon app-passwords-link"
              href="https://staging.bsky.app/settings/app-passwords"
              rel="noreferrer"
              target="_blank"
            >
              <SVGIcon name="cursorRight" />
              <span>{{ $t("useAppPasswords") }}</span>
            </a>
          </template>
        </EasyForm>
        <div class="account-container">
          <div class="account-header">{{ $t("yourAccounts") }}</div>
          <AccountList :hasDeleteButton="false" />
        </div>
      </div>
      <Copyright />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$width: 800px;

.login-popup {
  display: flex;
  justify-content: center;

  &__inner {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 2rem;
    padding: 4rem 2rem;
    max-width: $width;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    grid-gap: 1rem;
  }

  &__body {
    grid-gap: 2rem;
    @media (max-width: $width) {
      display: flex;
      flex-direction: column;
    }
    @media not all and (max-width: $width) {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
  &[data-has-accounts="false"] {
    .login-popup__body {
      grid-template-columns: unset;
    }

    .account-container {
      display: none;
    }
  }
}

.logo {
  font-size: 3rem;
}

.description {
  color: rgba(var(--fg-color), 0.5);
}

.app-passwords-link {
  margin-left: auto;
}

.account-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}

.account-header {
  @media not all and (max-width: $width) {
    text-align: right;
  }
}

.copyright {
  font-size: 0.875rem;
}
</style>
