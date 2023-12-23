<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params: any): void}>()

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

function fetchLists (direction: "new" | "old") {
  Util.blurElement()
  emit("fetch", direction)
}

function deleteList (listUri: string) {
  const targetIndex = props.lists.findIndex((list: TTList) => {
    return list.uri === listUri
  })
  if (targetIndex === - 1) return
  props.lists.splice(targetIndex, 1)
}
</script>

<template>
  <div class="lists">
    <LoadButton
      v-if="!mainState.isMyProfile()"
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchLists('new')"
    />
    <div class="list-card-container">
      <ListCard
        v-for="list of state.lists"
        :key="list.uri"
        :list="list"
        :createDisplay="false"
        :unclickable="false"
        @clicked="$emit('clicked')"
        @deleteList="deleteList(list.uri)"
      />
    </div>
    <LoadButton
      v-if="!mainState.isMyProfile()"
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

.list-card-container {
  flex-grow: 1;
}

.list-card:not(:last-child) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
