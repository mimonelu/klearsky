<script lang="ts" setup>
import { inject, ref } from "vue"
import type { MainState } from "@/@types/app.d"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="main-menu">
    <a class="avatar">
      <img
        loading="lazy"
        :src="'/img/void.png'"
      >
    </a>
  </div>
</template>

<style lang="scss" scoped>
.main-menu {
  padding: 1rem;
}

.avatar {
  display: block;
  height: var(--avatar-size);

  & > img {
    border: 1px solid rgba(var(--fg-color), 0.25);
    border-radius: 1px;
    object-fit: cover;
    min-width: 3rem;
    height: 3rem;
  }
}
</style>
