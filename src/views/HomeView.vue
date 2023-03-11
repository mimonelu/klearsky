<script lang="ts" setup>
import Copyright from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
</script>

<template>
  <div class="page">
    <Logo />
    <p>Applications for Bluesky will be added.</p>
    <menu>
      <RouterLink
        to="timeline"
        class="button"
      >Klearsky</RouterLink>
      <RouterLink
        to="upload-profile-images-form"
        class="button"
      >Upload Profile Images Form for Bluesky</RouterLink>
      <RouterLink
        to="post-record-form"
        class="button"
      >Post Record Form for Bluesky</RouterLink>
    </menu>
    <Copyright />
  </div>
</template>

<style lang="scss" scoped>
.page {
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
