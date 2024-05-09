<script lang="ts" setup>
import Popup from "@/components/popups/Popup.vue"
import LabelerCard from "@/components/cards/LabelerCard.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  title: string
  labelers: Array<TILabeler>
}>()

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="labeler-list-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="labeler" />
        <span>{{ $t(title) }}</span>
      </h2>
    </template>
    <template #body>
      <LabelerCard
        v-for="labeler of labelers"
        :key="labeler.uri"
        :labeler="labeler"
        :menuDisplay="true"
        :detailDisplay="false"
        @close="close"
        @onActivateMention="close"
        @onActivateHashTag="close"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.labeler-list-popup {
  &:deep() {
    .popup {
      &-header > h2 > .svg-icon {
        fill: rgb(var(--share-color));
      }

      &-body {
        flex-grow: 1;
        grid-gap: 1px;
        padding: unset;
      }
    }
  }
}
</style>
