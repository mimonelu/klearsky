<script lang="ts" setup>
import SVGIcon from "@/components/SVGIcon.vue"

defineProps<{
  handle?: string
  image?: string
  labels?: Array<TTLabel>
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'profile-post', query: { account: handle } }"
    class="avatar-link"
    :data-has-label="(labels?.length ?? 0) > 0"
  >
    <img
      loading="lazy"
      :src="image ?? '/img/void-avatar.png'"
      alt=""
    >

    <!-- ラベルアイコン -->
    <div
      v-if="(labels?.length ?? 0) > 0"
      class="label-icon"
    >
      <SVGIcon name="alert" />
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.avatar-link {
  cursor: pointer;
  display: block;
  position: relative;

  & > img {
    border-radius: var(--border-radius);
    display: block;
    min-width: 1em;
    max-width: 1em;
    min-height: 1em;
    max-height: 1em;
  }
  &[data-has-label="true"] > img {
    filter: grayscale(1.0);
    opacity: 0.5;
  }
}

// ラベルアイコン
.label-icon {
  background-color: black;
  border: 1px solid rgb(var(--bg-color));
  border-radius: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 0.5em;
  height: 0.5em;

  & > .svg-icon {
    fill: rgb(var(--notice-color));
    font-size: 0.3125em;
  }
}
</style>
