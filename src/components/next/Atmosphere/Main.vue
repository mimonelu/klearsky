<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  title: string
  uri: string
}>()
</script>

<template>
  <div class="atmosphere">
    <div class="atmosphere__header">
      <a
        class="atmosphere__header__title"
        :href="uri"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="openInApp" />
        <span>{{ $t(title) }}</span>
      </a>
    </div>
    <div class="atmosphere__body">
      <slot name="body" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.atmosphere {
  &__header {
    &__title {
      --alpha: 0.75;
      display: grid;
      grid-gap: 0.5em;
      grid-template-columns: auto 1fr;
      align-items: center;
      padding: 0.25em 0.5em;
      &:focus, &:hover {
        --alpha: 1.0;
      }

      & > .svg-icon {
        fill: rgb(var(--cyan-dark-color), var(--alpha));
      }

      & > span {
        color: rgb(var(--cyan-dark-color), var(--alpha));
        font-weight: bold;
        line-height: var(--line-height-middle);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
