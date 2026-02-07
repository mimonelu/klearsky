<script lang="ts" setup>
import { ref } from "vue"
import AccountList from "@/components/next/Account/AccountList.vue"
import Copyright from "@/components/labels/Copyright.vue"
import LoginForm from "@/components/next/Login/LoginForm.vue"
import Logo from "@/components/images/Logo.vue"

defineExpose({
  setHasAuthFactorToken,
  setAccountToLoginForm,
})

const loginForm = ref(null)

async function setHasAuthFactorToken (value: boolean) {
  await (loginForm.value as any)?.setHasAuthFactorToken(value)
}

async function setAccountToLoginForm (session: TTSession) {
  await (loginForm.value as any)?.setAccountToLoginForm(session)
}
</script>

<template>
  <div class="login-popup">
    <div class="login-popup__inner">
      <div class="login-popup__header">
        <Logo />
        <div class="description">Alt Web Client for Bluesky</div>
      </div>
      <div class="login-popup__body">
        <LoginForm
          ref="loginForm"
          @login="(...args) => $emit('login', ...args)"
          @signUp="(...args) => $emit('signUp', ...args)"
          @oauthLogin="(...args) => $emit('oauthLogin', ...args)"
        />
        <div class="account-container">
          <div class="account-header">{{ $t("myAccounts") }}</div>
          <AccountList :isAtLoginPopup="true" />
        </div>
      </div>
      <Copyright />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$width: 768px;

.login-popup {
  background-color: rgb(var(--fg-color), 0.125);
  display: flex;
  justify-content: center;
  min-height: 100vh;

  &__inner {
    display: grid;
    grid-template-rows: 1fr auto auto;
    flex-grow: 1;
    grid-gap: 2rem;
    padding-bottom: 2rem;
  }

  &__header {
    background-color: rgb(var(--bg-color));
    border-bottom: 1px solid rgb(var(--fg-color), 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    grid-gap: 0.5rem;
    padding: 6rem 2rem;
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
  color: rgb(var(--fg-color), 0.75);
  font-size: min(1.25rem, 2vmax);
}

.account-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.75rem;
}

.account-header {
  color: rgb(var(--fg-color), 0.75);
  font-weight: bold;
}

.copyright {
  font-size: 0.875rem;
  padding: 0 2rem;
  text-align: center;
}
</style>
