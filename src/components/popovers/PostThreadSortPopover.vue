<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  display: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

function getCurrentSort (): "oldest" | "newest" | "most-likes" | "hotness" {
  const pref = mainState.currentPreferences.find(
    (pref) => pref.$type === "app.bsky.actor.defs#threadViewPref"
  ) as TTPreferenceThreadView | undefined
  return pref?.sort ?? "oldest"
}

function isCurrentSort (sort: "oldest" | "newest" | "most-likes" | "hotness"): boolean {
  return getCurrentSort() === sort
}

async function selectSort (sort: "oldest" | "newest" | "most-likes" | "hotness") {
  Util.blurElement()
  close()

  // PostViewの関数をコール
  if (mainState.postThreadSortPopoverCallback != null) {
    mainState.postThreadSortPopoverCallback(sort)
  }
}

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  (popover.value as typeof Popover).open(
    mainState.postThreadSortPopoverSelector,
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
</script>

<template>
  <Popover
    class="post-thread-sort-popover"
    ref="popover"
    @close="close"
  >
    <menu class="list-menu">
      <!-- Oldest -->
      <button @click.stop="selectSort('oldest')">
        <SVGIcon
          name="check"
          :data-visibility="isCurrentSort('oldest')"
        />
        <SVGIcon name="arrowDown" />
        <span>{{ $t("postThreadSortOldest") }}</span>
      </button>

      <!-- Newest -->
      <button @click.stop="selectSort('newest')">
        <SVGIcon
          name="check"
          :data-visibility="isCurrentSort('newest')"
        />
        <SVGIcon name="arrowUp" />
        <span>{{ $t("postThreadSortNewest") }}</span>
      </button>

      <!-- Most Likes -->
      <button @click.stop="selectSort('most-likes')">
        <SVGIcon
          name="check"
          :data-visibility="isCurrentSort('most-likes')"
        />
        <SVGIcon name="like" />
        <span>{{ $t("postThreadSortMostLikes") }}</span>
      </button>

      <!-- Hotness -->
      <button @click.stop="selectSort('hotness')">
        <SVGIcon
          name="check"
          :data-visibility="isCurrentSort('hotness')"
        />
        <SVGIcon name="fire" />
        <span>{{ $t("postThreadSortHotness") }}</span>
      </button>
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.post-thread-sort-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }

  .svg-icon[data-visibility="false"] {
    visibility: hidden;
  }
}
</style>
