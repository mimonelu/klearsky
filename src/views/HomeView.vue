<script lang="ts" setup>
import Copyright from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
</script>

<template>
  <div class="home-view">
    <div class="header">
      <Logo />
      <div>Unofficial Web Client for Bluesky</div>
    </div>
    <RouterLink
      to="timeline"
      class="button--large"
    >Launch Klearsky</RouterLink>
    <Copyright />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 4rem;
  padding: 4rem;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 1rem;
}

.logo {
  font-size: 4rem;
}
</style>
