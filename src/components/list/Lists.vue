<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"
import List from "@/components/list/List.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Util from "@/composables/util"

const props = defineProps<{
  lists: Array<TTList>
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  lists: ComputedRef<Array<TTList>>
}>({
  lists: computed((): Array<TTList> => {
    return props.lists.filter((list: TTList) => {
      return !list.viewer?.muted && !list.viewer?.blocked
    })
  }),
})

async function fetchLists (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchAuthorLists(direction)
  mainState.listProcessing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchLists("old")
})
</script>

<template>
  <div class="lists">
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchLists('new')"
    />
    <div class="list-container">
      <List
        v-for="list of state.lists"
        :key="list.uri"
        :list="list"
      />
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchLists('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.lists {
  display: flex;
  flex-direction: column;
}

.list-container {
  flex-grow: 1;
}

.list:not(:last-of-type) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
