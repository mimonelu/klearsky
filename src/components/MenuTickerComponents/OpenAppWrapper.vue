<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import otherApps from "@/consts/other-apps.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  type: "post" | "profile";
  did?: string;
  handle?: string;
  uri?: string;
}>()

const state = reactive<{
  otherAppDisplay: boolean;
}>({
  otherAppDisplay: false,
})

function openOtherApp (app: any) {
  emit("close")
  let uri = ""
  if (props.type === "profile") {
    uri = app.profileUri
      .replace("{did}", props.did)
      .replace("{handle}", props.handle)
  } else if (props.type === "post") {
    const rkey = (props.uri?.match(/\/([^\/]+)$/) ?? ["", ""])[1]
    uri = app.postUri
      .replace("{did}", props.did)
      .replace("{handle}", props.handle)
      .replace("{rkey}", rkey)
      .replace("{uri}", props.uri)
  }
  window.open(uri)
}
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.prevent.stop
    @mouseenter="state.otherAppDisplay = true"
    @mouseleave="state.otherAppDisplay = false"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("openOtherApp") }}</span>

    <!-- 他のアプリで開くメニュー -->
    <MenuTicker
      :display="state.otherAppDisplay"
      class="menu-ticker__sub"
    >
      <template v-for="app of otherApps">
        <button
          @click.prevent.stop="openOtherApp(app)"
        >
          <SVGIcon name="openInApp" />
          <span>{{ $t(app.name) }}</span>
        </button>

        <hr v-if="app.separator" />
      </template>
    </MenuTicker>
  </button>
</template>
