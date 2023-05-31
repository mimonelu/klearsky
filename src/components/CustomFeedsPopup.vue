<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="custom-feeds-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="rss" />
        <span>{{ $t("customFeeds") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div>OK</div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.custom-feeds-popup:deep() {
  .popup-header > h2 {
    color: rgb(var(--accent-color));

    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }
  }
}
</style>
