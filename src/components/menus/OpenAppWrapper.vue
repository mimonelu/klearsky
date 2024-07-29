<script lang="ts" setup>
import { inject, nextTick, reactive, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import OTHER_APPS from "@/consts/other-apps.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  type: "generator" | "list" | "post" | "profile" | "starterPack"
  did?: string
  handle?: string
  uri?: string
  container?: HTMLElement
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  display: boolean
}>({
  display: false,
})

const trigger = ref(null)

const popover = ref(null)

async function open () {
  state.display = true
  await nextTick()
  if (trigger.value == null || popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    trigger.value,
    {
      positionX: "left",
      positionY: "middle",
      directionX: "left",
      directionY: "middle",
      collideX: true,
      collideY: true,
      animationDirection: "left",
      isChild: true,
    }
  )
}

function close () {
  state.display = false
}

function openOtherApp (app: any) {
  emit("close")
  let uri = ""
  switch (props.type) {
    case "generator": {
      uri = app.generator
        .replace("{uri}", props.uri)
        .replace("{uriWithoutFeed}", props.uri?.replace("/feed", "") ?? "")
      break
    }
    case "list": {
      const rkey = Util.getRkey(props.uri)
      uri = app.list
        .replace("{did}", props.did)
        .replace("{mydid}", mainState.atp.data.did)
        .replace("{handle}", props.handle)
        .replace("{rkey}", rkey)
        .replace("{uri}", props.uri)
      break
    }
    case "post": {
      const rkey = Util.getRkey(props.uri)
      uri = app.post
        .replace("{did}", props.did)
        .replace("{mydid}", mainState.atp.data.did)
        .replace("{handle}", props.handle)
        .replace("{rkey}", rkey)
        .replace("{uri}", props.uri)
      break
    }
    case "profile": {
      uri = app.profile
        .replace("{did}", props.did)
        .replace("{mydid}", mainState.atp.data.did)
        .replace("{handle}", props.handle)
      break
    }
    case "starterPack": {
      const rkey = Util.getRkey(props.uri)
      uri = app.starterPack
        .replace("{did}", props.did)
        .replace("{rkey}", rkey)
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
    ref="trigger"
    @click.prevent.stop
    @mouseenter="open"
    @mouseleave="close"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("openOtherApp") }}</span>

    <!-- 外部アプリで開くメニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <template v-for="app of OTHER_APPS">
          <template v-if="app[type] != null">
            <hr v-if="app[type] === 'separator'" />
            <button
              v-else
              @click.prevent.stop="openOtherApp(app)"
            >
              <SVGIcon name="openInApp" />
              <span>{{ $t(app.name) }}</span>
            </button>
          </template>
        </template>
      </menu>
    </Popover>
  </button>
</template>

<style lang="scss" scoped>
.popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
