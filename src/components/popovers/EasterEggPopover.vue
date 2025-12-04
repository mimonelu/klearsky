<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
}>()

const mainState = inject("state") as MainState

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  (popover.value as typeof Popover).open(
    mainState.easterEggPopoverSelector,
    {
      positionX: "left",
      positionY: "bottom",
      directionX: "right",
      directionY: "down",
      collideX: true,
      collideY: true,
      animationDirection: "down",
      isChild: false,
    }
  )
}

function close () {
  emit("close")
}

function onClickItem (type: string) {
  Util.blurElement()
  if (mainState.easterEggPopoverCallback != null) {
    mainState.easterEggPopoverCallback(type)
  }
  close()
}
</script>

<template>
  <Popover
    class="easter-egg-popover"
    ref="popover"
    @close="close"
  >
    <div class="easter-egg-content">
      <div
        class="list-menu__item"
        @click.stop="onClickItem('invertText')"
      >
        <SVGIcon name="translate" />
        <span>{{ $t("テキストを反転する") }}</span>
      </div>
    </div>
  </Popover>
</template>

<style lang="scss" scoped>
.easter-egg-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
