<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import type { MainState } from "@/@types/app.d"

const state = reactive<{
  service: string
  identifier: string
  password: string
}>({
  service: "https://bsky.social",
  identifier: "",
  password: ""
})

const mainState: MainState = inject("state") as MainState

const $t = inject("$t") as Function

const submitCallback = async () => {
  mainState.hasLogin = await mainState.atp.login(state.identifier, state.password)
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
  <div class="popup-overlay login-popup">
    <div class="popup">
      <h1 class="header">
        <SVGIcon name="shimmer" />
        <span>{{ $t("title") }}</span>
      </h1>
      <EasyForm v-bind="easyFormProps" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  grid-gap: 0.5rem;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
    font-size: 1.25rem;
  }

  & > span {
    font-size: 2rem;
  }
}
</style>
