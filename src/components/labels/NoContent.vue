<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue"
</script>

<template>
  <div class="no-content textlabel">
    <div class="textlabel__text">
      <SVGIcon name="alert" />{{ $t("noContent") }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.textlabel__text {
  color: rgb(var(--fg-color), 0.5);
}

.svg-icon {
  fill: rgb(var(--fg-color), 0.5);
}
</style>
