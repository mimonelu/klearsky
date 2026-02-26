<script lang="ts" setup>
import { computed, inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
}>()

const mainState = inject("state") as MainState

const popover = ref(null)

const isRestoreDisabled = computed(() => {
  return (
    mainState.easterEggPopoverHasSavedText == null ||
    !mainState.easterEggPopoverHasSavedText()
  )
})

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

function onClickMyWordItem () {
  Util.blurElement()
  mainState.openMyWordPopup('select')
  close()
}
</script>

<template>
  <Popover
    class="easter-egg-popover"
    ref="popover"
    @close="close"
  >
    <div class="easter-egg-content list-menu">
      <!-- マイワードポップアップトリガー -->
      <div
        class="list-menu__item"
        @click.stop="onClickMyWordItem"
      >
        <SVGIcon name="alphaA" />
        <span>{{ $t("myWord") }}</span>
      </div>

      <hr />
      <div class="list-menu__header">
        <span>{{ $t("easterEggFancyText") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('invertText')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggInvert") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('punctuateText')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggSpaceOut") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('makeTextBold')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggBold") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('italicizeText')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggItalic") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('strikethroughText')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggStrikethrough") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('convertToZenkaku')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggFullWidth") }}</span>
      </div>
      <div
        class="list-menu__item"
        @click.stop="onClickItem('convertToHankaku')"
      >
        <SVGIcon name="formatFont" />
        <span>{{ $t("easterEggHalfWidth") }}</span>
      </div>
      <hr />
      <div
        class="list-menu__item"
        :disabled="isRestoreDisabled"
        @click.stop="onClickItem('restoreText')"
      >
        <SVGIcon name="arrowLeft" />
        <span>{{ $t("easterEggRestore") }}</span>
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
