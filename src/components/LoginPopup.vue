<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Logo from "@/components/Logo.vue"
import Popup from "@/components/Popup.vue"

const emit = defineEmits<{(event: string, identifier: string, password: string): void}>()

const state = reactive<{
  service: string
  identifier: string
  password: string
}>({
  service: "https://bsky.social",
  identifier: "",
  password: ""
})

const $t = inject("$t") as Function

const submitCallback = async () => {
  emit("login", state.service, state.identifier, state.password)
}

const easyFormProps = {
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
    },
    {
      state,
      model: "identifier",
      label: $t("identifier"),
      type: "text",
      required: true,
      placeholder: "you.bsky.social, your@email.address, did:plc:xxx...",
      autocomplete: "username",
      focus: true,
    },
    {
      state,
      model: "password",
      label: $t("password"),
      type: "password",
      required: true,
      autocomplete: "current-password",
    }
  ],
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
.logo {
  font-size: 2rem;
}
</style>
