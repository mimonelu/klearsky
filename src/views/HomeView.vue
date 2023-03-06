<script lang="ts" setup>
import Copyright from "@/components/Copyright.vue"
import SVGIcon from "@/components/SVGIcon.vue"
</script>

<template>
  <div class="page">
    <h1>
      <SVGIcon name="shimmer" />
      <span>Klearsky</span>
    </h1>
    <p>Applications for Bluesky will be added.</p>
    <menu>
      <router-link
        to="profile"
        class="button"
      >Klearsky</router-link>
      <router-link
        to="upload-profile-images-form"
        class="button"
      >Upload Profile Images Form for Bluesky</router-link>
      <router-link
        to="post-record-form"
        class="button"
      >Post Record Form for Bluesky</router-link>
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
  width: 100vw;
  height: 100vh;

  h1 {
    display: flex;
    align-items: baseline;
    grid-gap: 1rem;
    font-size: 3rem;

    .svg-icon {
      fill: rgb(var(--accent-color));
      font-size: 2rem;
    }
  }

  menu {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
  }
}
</style>
