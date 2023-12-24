<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params: any): void}>()

const props = defineProps<{
  lists: Array<TTList>
  loaderDisplay: boolean
  isCompact: boolean
  unclickable: boolean
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

function clicked (list?: TTList) {
  emit("clicked", list)
}
</script>

<template>
  <div class="lists">
    <LoadButton
      v-if="loaderDisplay"
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchLists('new')"
    />

    <!-- 空リストメッセージ -->
    <div
      v-if="!mainState.listProcessing && state.lists.length === 0"
      class="textlabel lists__nolist"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noList") }}
      </div>
    </div>

    <div class="lists__list-card-container">
      <ListCard
        v-for="list of state.lists"
        v-slot="{ list }"
        :key="list.uri"
        :list="list"
        :isCompact="isCompact"
        :createDisplay="false"
        :unclickable="unclickable"
        @clicked="clicked"
        @deleteList="deleteList(list.uri)"
      >
        <slot :list="list" />
      </ListCard>
    </div>
    <LoadButton
      v-if="loaderDisplay"
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

  &__nolist {
    margin: 1rem;
  }

  &__list-card-container {
    flex-grow: 1;
  }
}

.list-card:not(:last-child) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
