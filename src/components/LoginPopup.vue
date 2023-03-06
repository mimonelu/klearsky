<script lang="ts" setup>
import { inject, reactive } from "vue"

const state = reactive<{
  service: string
  identifier: string
  password: string
}>({
  service: "https://bsky.social",
  identifier: "",
  password: ""
})

const rootState: MainState = inject("state") as MainState

const submit = async () => {
  rootState.hasLogin = await rootState.atp.login(state.identifier, state.password)
}
</script>

<template>
  <div class="login-popup">
    <div class="popup">
      <h2 class="header">Login</h2>
      <form
        @submit.prevent="submit"
        spellcheck="false"
      >
        <dl>
          <dt>{{ $t("prf-service") }}</dt>
          <dd>
            <input
              v-model="state.service"
              class="textbox"
              type="url"
              required="true"
              placeholder="https://bsky.social"
            />
          </dd>
        </dl>
        <dl>
          <dt>{{ $t("prf-identifier") }}</dt>
          <dd>
            <input
              v-model="state.identifier"
              class="textbox"
              type="text"
              required="true"
              placeholder="you.bsky.social, your@email.address, did:plc:xxx..."
              autocomplete="username"
            />
          </dd>
        </dl>
        <dl>
          <dt>{{ $t("prf-password") }}</dt>
          <dd>
            <input
              v-model="state.password"
              class="textbox"
              type="password"
              required="true"
              autocomplete="current-password"
            />
          </dd>
        </dl>
        <button class="button">ログイン</button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-popup {
  background-color: rgba(var(--fg-color), 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}

.popup {
  background-color: rgb(var(--bg-color));
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  margin: 3rem;
  padding: 3rem;
}

.header {
  font-size: 2rem;
}
</style>
