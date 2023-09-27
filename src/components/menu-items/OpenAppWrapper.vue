<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import OTHER_APPS from "@/consts/other-apps.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  type: "generator" | "post" | "profile"
  did?: string
  handle?: string
  uri?: string
  container?: HTMLElement
}>()

const state = reactive<{
  display: boolean
}>({
  display: false,
})

function showSubMenuTicker () {
  setTimeout(() => { state.display = true }, 1)
}

function openOtherApp (app: any) {
  emit("close")
  let uri = ""
  switch (props.type) {
    case "generator": {
      uri = app.generator
        .replace("{uri}", props.uri)
      break
    }
    case "post": {
      const rkey = Util.getRkey(props.uri)
      uri = app.post
        .replace("{did}", props.did)
        .replace("{handle}", props.handle)
        .replace("{rkey}", rkey)
        .replace("{uri}", props.uri)
      break
    }
    case "profile": {
      uri = app.profile
        .replace("{did}", props.did)
        .replace("{handle}", props.handle)
      break
    }
    default: break
  }
  window.open(uri)
}
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.prevent.stop
    @mouseenter="showSubMenuTicker"
    @mouseleave="state.display = false"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("openOtherApp") }}</span>

    <!-- 外部アプリで開くメニュー -->
    <MenuTicker
      class="menu-ticker__sub"
      :display="state.display"
      :container="container"
    >
      <template v-for="app of OTHER_APPS">
        <template v-if="app[type] != null">
          <button @click.prevent.stop="openOtherApp(app)">
            <SVGIcon name="openInApp" />
            <span>{{ $t(app.name) }}</span>
          </button>
        </template>
      </template>
    </MenuTicker>
  </button>
</template>
