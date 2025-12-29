<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"

defineProps<{
  uri: string
}>()
</script>

<template>
  <div class="post-not-exists">
    <p class="post-not-exists__message">{{ $t("postNotFound") }}</p>
    <p class="post-not-exists__uri">{{ uri }}</p>
    <button
      type="button"
      class="post-not-exists__button button--important"
      @click.stop="$emit('delete', uri)"
    >
      <SVGIcon name="remove" />
      <span>{{ $t("delete") }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.post-not-exists {
  background-color: rgb(var(--fg-color), 0.125);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  padding: 0.75rem;

  &__message,
  &__uri {
    grid-column-end: span 2;
  }

  &__uri {
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875rem;
    user-select: text;
  }

  &__button {
    grid-column-start: 2;
  }
}
</style>
