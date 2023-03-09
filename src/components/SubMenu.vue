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
  grid-gap: 2rem;
  padding: 2rem 1rem 1rem 1rem;
}

.copyright {
  font-size: 0.875rem;
}
</style>
