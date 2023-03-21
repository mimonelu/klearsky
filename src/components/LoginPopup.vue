<script lang="ts" setup>
import { inject, reactive } from "vue"
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

const state = reactive<{
  service: string
  identifier: string
  password: string
}>({
  service: "https://bsky.social",
  identifier: "",
  password: ""
})

const easyFormProps: KEasyForm = {
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
      placeholder: "you.bsky.social, your@email.address, did:plc:xxx...",
      autocomplete: "on",
      inputmode: "email",
      focus: true,
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

async function submitCallback () {
  emit("login", state.service, state.identifier, state.password)
}
</script>

<template>
  <Popup
    class="login-popup"
    :hasCloseButton="true"
  >
    <template v-slot:body>
      <Logo />
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.login-popup:deep() {
  .popup {
    width: $router-view-width;
  }
}

.logo {
  font-size: 2rem;
}
</style>
