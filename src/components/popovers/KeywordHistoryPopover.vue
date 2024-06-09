<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  selector?: string | HTMLElement
  keywords: string[]
  callback?: Function
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    props.selector,
    {
      positionX: "right",
      positionY: "bottom",
      directionX: "left",
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

function add () {
  close()

  // キーワード履歴に保存
  mainState.addKeywordHistory(
    mainState.currentSearchTerm,
    props.keywords
  )
  mainState.saveSettings()
}

function select (keyword: string) {
  close()
  if (props.callback != null) {
    props.callback(keyword)
  }
}

function remove (index: number) {
  close()
  props.keywords.splice(index, 1)
}
</script>

<template>
  <Popover
    class="keyword-history-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <button
        type="button"
        @click.stop="add"
      >
        <SVGIcon name="plus" />
        <span>{{ $t("add") }}</span>
      </button>
      <hr />

      <div
        v-if="keywords.length === 0"
        class="list-menu__header"
      >{{ $t("noHistory") }}</div>
      <template v-else>
        <button
          v-for="keyword, index of keywords"
          :key="index"
          type="button"
          class="keyword-history-popover__item-button"
          @click="select(keyword)"
        >
          <span>{{ keyword }}</span>

          <!-- キーワード履歴削除ボタン -->
          <button
            type="button"
            class="keyword-history-popover__remove-button button--plane"
            @click.stop="remove(index)"
          >
            <SVGIcon name="cross" />
          </button>
        </button>
      </template>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.keyword-history-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
      max-width: $sp-width;
    }
  }

  &__message {
    font-weight: bold;
    padding: 0.25rem 1rem;
  }

  &__item-button {
    display: grid;
    grid-gap: 0;
    grid-template-columns: 1fr auto;
    padding: 0.25rem 0 0.25rem 1rem;

    & > span {
      line-height: 1.125;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__remove-button {
    --fg-color: var(--notice-color);
    padding: 0.25em 1em;
  }
}
</style>
