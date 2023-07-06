<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  log?: any;
}>()

const mainState = inject("state") as MainState

function makeAlsoKnownAs (alsoKnownAs?: Array<string>): string {
  if (alsoKnownAs == null) return ""
  return alsoKnownAs
    .map((item: string) => item.replace("at://", ""))
    .join(", ")
}

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="handle-history-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="history" />
        <span>{{ $t("handleHistory") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <template v-if="log != null">
        <div
          v-for="item, itemIndex of log"
          :key="itemIndex"
          class="item"
        >
          <div
            v-if="item.operation?.handle"
            class="handle"
          >{{ item.operation?.handle }}</div>
          <div
            v-else
            class="handle"
          >{{ makeAlsoKnownAs(item.operation?.alsoKnownAs) }}</div>
          <div class="created-at">{{ mainState.formatDate(item.createdAt) }}</div>
        </div>
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.handle-history-popup {
  &:deep() {
    .popup {
      width: calc($router-view-width - 4rem);

      &-body {
        grid-gap: 0.5rem;
      }
    }
  }

  .item {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    grid-gap: 0.5rem;
    padding: 0 0.5rem 0.25rem;
  }

  .handle {
    line-height: var(--line-height);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .created-at {
    color: rgba(var(--fg-color), 0.5);
    font-size: 0.875rem;
    line-height: var(--line-height);
    white-space: nowrap;
  }
}
</style>
