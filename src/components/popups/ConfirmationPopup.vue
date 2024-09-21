<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const cancelButton = ref()

onMounted(() => {
  cancelButton.value.focus()
})

function close () {
  emit("close")
}

function apply () {
  emit("apply")
}
</script>

<template>
  <Popup
    class="confirmation-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <span>{{ mainState.confirmationPopupProps.title ?? $t("confirmation") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="text">{{ mainState.confirmationPopupProps.text }}</div>
      <Post
        v-if="mainState.confirmationPopupProps.post != null"
        :post="mainState.confirmationPopupProps.post"
        position="preview"
      />
      <div
        v-if="mainState.confirmationPopupProps.detail != null"
        class="detail"
      >{{ mainState.confirmationPopupProps.detail }}</div>
    </template>
    <template #footer>
      <div class="button-container">
        <button
          class="button--bordered"
          ref="cancelButton"
          @click="close"
        >
          <span>{{ $t("no") }}</span>
        </button>
        <button
          class="button"
          @click="apply"
        >
          <span>{{ $t("yes") }}</span>
        </button>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.confirmation-popup {
  .post {
    border-radius: var(--border-radius-middle);
    font-size: 1em;

    &:deep() > * {
      font-size: 0.75em;
    }
  }

  .text,
  .detail {
    line-height: var(--line-height-high);
    user-select: text;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .detail {
    background-color: rgb(var(--fg-color), 0.125);
    border-radius: var(--border-radius-middle);
    color: rgb(var(--fg-color), 0.75);
    padding: 0.5rem 1rem;
  }

  .button-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
    margin: 1rem;
  }
}
</style>
