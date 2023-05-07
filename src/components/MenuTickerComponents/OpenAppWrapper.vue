<script lang="ts" setup>
import { reactive } from "vue"
import { AtUri } from "@atproto/uri"
import MenuTicker from "@/components/MenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import otherApps from "@/consts/other-apps.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  type: "post" | "profile";
  handle?: string;
  uri?: string;
}>()

const state = reactive<{
  otherAppDisplay: boolean;
}>({
  otherAppDisplay: false,
})

function openOtherApp (app: any) {
  let uri = ""
  if (props.type === "profile") {
    uri = app.profileUri.replace("{handle}", props.handle)
  } else if (props.type === "post") {
    const aturi = new AtUri(props.uri as string)
    uri = app.postUri
      .replace("{handle}", props.handle)
      .replace("{rkey}", aturi.rkey)
  }
  window.open(uri)
  emit("close")
}
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.stop
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
      <button
        v-for="app of otherApps"
        :key="app.name"
        @click.stop="openOtherApp(app)"
      >
        <SVGIcon name="shimmer" />
        <span>{{ $t(app.name) }}</span>
      </button>
    </MenuTicker>
  </button>
</template>
