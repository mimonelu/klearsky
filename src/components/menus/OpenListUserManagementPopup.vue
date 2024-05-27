<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser;
}>()

const mainState = inject("state") as MainState

function onActivate () {
  if (props.user == null) {
    emit("close")
    return
  }
  mainState.openListUserManagementPopup({
    user: props.user,
  })
  emit("close")
}
</script>

<template>
  <button @click.prevent.stop="onActivate">
    <SVGIcon name="list" />
    <span>{{ $t("listUserManagement") }}</span>
  </button>
</template>
