<script lang="ts" setup>
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  processing: boolean
  title: string
  icon: string
  uri?: string
}>()
</script>

<template>
  <div class="atmosphere-item">
    <div class="atmosphere-item__header">
      <!-- サービスタイトル -->
      <div class="atmosphere-item__title">
        <img
          :src="icon"
          alt=""
        />
        <span translate="no">{{ $t(title) }}</span>
      </div>

      <!-- サービスリンク -->
      <a
        v-if="uri"
        class="atmosphere-item__link"
        :href="uri"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="openInApp" />
      </a>
    </div>
    <div class="atmosphere-item__body">
      <slot name="body" />
    </div>
    <Loader v-if="processing" />
  </div>
</template>

<style lang="scss" scoped>
.atmosphere-item {
  background-color: rgb(var(--bg-color), 0.75);
  border: 1px solid rgb(var(--blue-color), 0.5);
  border-radius: var(--border-radius-middle);
  overflow: hidden;
  position: relative;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__body {
    overflow: hidden;
  }

  // サービスタイトル
  &__title {
    background-color: rgb(var(--blue-color), 0.5);
    border-radius: 0 0 var(--border-radius-middle) 0;
    display: grid;
    grid-gap: 0.25rem;
    grid-template-columns: auto 1fr;
    align-items: center;
    padding: 0 0.5rem;
    min-height: 2rem;

    & > img {
      width: 0.875em;
      height: 0.875em;
    }

    & > span {
      color: white;
      font-size: 0.875rem;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // サービスリンク
  &__link {
    --alpha: 0.75;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    min-height: 2rem;
    &:focus, &:hover {
      --alpha: 1.0;
    }

    & > .svg-icon {
      fill: rgb(var(--cyan-dark-color), var(--alpha));
    }
  }

  .loader {
    font-size: 0.75rem;
  }
}
</style>
