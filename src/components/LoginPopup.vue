<script lang="ts" setup>
import { inject, reactive } from "vue"
import AccountList from "@/components/AccountList.vue"
import EasyForm from "@/components/EasyForm.vue"
import Logo from "@/components/Logo.vue"
import Popup from "@/components/Popup.vue"

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
  <Popup
    class="login-popup"
    :hasCloseButton="false"
  >
    <template v-slot:header>
      <Logo />
      <div class="description">Unofficial Web Client for Bluesky</div>
    </template>
    <template v-slot:body>
      <div class="body">
        <EasyForm v-bind="easyFormProps" />
        <div class="body__right">
          <div class="account-header">{{ $t("yourAccounts") }}</div>
          <AccountList :hasDeleteButton="false" />
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
$width: 800px;

.login-popup:deep() {
  background-color: rgb(var(--bg-color));

  .popup {
    border: unset;
    box-shadow: unset;
    margin: unset;
    width: $width;
    max-width: 100%;
    max-height: 100vh;

    &-header {
      flex-direction: column;
      grid-gap: 1rem;
      padding: 2rem;
      min-height: unset;
    }

    &-body {
      grid-gap: 2rem;
    }
  }
}

.logo {
  font-size: 3rem;
}

.description {
  text-align: center;
}

.body {
  grid-gap: 2rem;
  @media (max-width: $width) {
    display: flex;
    flex-direction: column;
  }
  @media not all and (max-width: $width) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  &__right {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
  }
}

.account-header {
  @media not all and (max-width: $width) {
    text-align: right;
  }
}
</style>
