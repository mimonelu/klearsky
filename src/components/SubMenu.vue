<script lang="ts" setup>
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
</script>

<template>
  <div class="sub-menu">
    <Logo />
    <CopyRight />
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  grid-gap: 3rem;
  padding-top: 3rem;
  position: relative;
}

.logo {
  font-size: 2rem;
}

.copyright {
  font-size: 0.875rem;
  padding: 0 1rem;
}
</style>
