<script lang="ts" setup>
import { computed, nextTick, reactive, ref, type ComputedRef } from "vue"
import MenuTickerCopyText from "@/components/menus/CopyText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  place?: "feed" | "list" | "post" | "profile" | "starterPack"
  uri?: string
  did?: string
  displayName?: string
  handle?: string
  text?: string
  container?: HTMLElement
}>()

const state = reactive<{
  display: boolean
  officialUrl: ComputedRef<undefined | string>
}>({
  display: false,
  officialUrl: computed((): undefined | string => {
    switch (props.place) {
      case "feed": {
        const uri = props.uri?.replace('at://', '').replace('app.bsky.feed.generator', 'feed')
        return `https://bsky.app/profile/${uri}`
      }
      case "list": {
        const rkey = Util.getRkey(props.uri)
        return `https://bsky.app/profile/${props.handle}/lists/${rkey}`
      }
      case "post": {
        const rkey = Util.getRkey(props.uri)
        return `https://bsky.app/profile/${props.handle}/post/${rkey}`
      }
      case "profile": {
        return `https://bsky.app/profile/${props.handle}`
      }
      case "starterPack": {
        const rkey = Util.getRkey(props.uri)
        return `https://bsky.app/starter-pack/${props.did}/${rkey}`
      }
    }
  }),
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
    <span>{{ $t("copy") }}</span>

    <!-- コピーするメニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- 公式 URL をコピーする -->
        <MenuTickerCopyText
          v-if="place != null"
          label="copyOfficialUrl"
          :text="state.officialUrl"
          @close="emit('close')"
        />

        <!-- URI をコピーする -->
        <MenuTickerCopyText
          v-if="uri != null"
          label="copyAtUri"
          :text="uri"
          @close="emit('close')"
        />

        <!-- DID をコピーする -->
        <MenuTickerCopyText
          v-if="did != null"
          label="copyDid"
          :text="did"
          @close="emit('close')"
        />

        <!-- 表示名をコピーする -->
        <MenuTickerCopyText
          v-if="displayName"
          label="copyDisplayName"
          :text="displayName"
          @close="emit('close')"
        />

        <!-- ハンドルをコピーする -->
        <MenuTickerCopyText
          v-if="handle"
          label="copyHandle"
          :text="handle"
          @close="emit('close')"
        />

        <!-- テキストをコピーする -->
        <MenuTickerCopyText
          v-if="text"
          label="copyPostText"
          :text="text"
          @close="emit('close')"
        />
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
