<script lang="ts" setup>
import Copyright from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
</script>

<template>
  <div class="home-view">
    <Logo />
    <menu>
      <RouterLink
        to="timeline"
        class="button--large"
      >Launch Klearsky</RouterLink>
    </menu>
    <Copyright />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-gap: 2rem;
  height: 100vh;

  menu {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }
}

.logo {
  font-size: 3rem;
}
</style>
