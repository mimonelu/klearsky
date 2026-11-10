<script lang="ts" setup>
import { computed, inject, nextTick, reactive, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{
  (event: "toggleNoUnauthenticated"): void
  (event: "toggleHideFromAlgorithmicRecommendations"): void
  (event: "openActorStatusEditPopup"): void
  (event: "openActivitySubscriptionPermissionPopup"): void
}>()

const props = defineProps<{
  hasNoUnauthenticated: boolean

  // 未取得、または取得に失敗した場合は `undefined`
  hideFromAlgorithmicRecommendations: undefined | boolean
  hasLive: boolean
  allowSubscriptions: "followers" | "mutuals" | "none"
}>()

const $t = inject("$t") as Function

// 購読の許可設定の状態ラベルの色
const allowSubscriptionsColor = computed((): undefined | "yellow" | "notice" => {
  switch (props.allowSubscriptions) {
    case "mutuals": {
      return "yellow"
    }
    case "none": {
      return "notice"
    }
    default: {
      return undefined
    }
  }
})

const state = reactive<{
  display: boolean
}>({
  display: false,
})

const popover = ref(null)

async function open ($event: Event) {
  Util.blurElement()
  state.display = true
  await nextTick()
  if (popover.value == null) {
    return
  }
  (popover.value as typeof Popover).open(
    $event.target,
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
  state.display = false
}

function select (callback: () => void) {
  close()
  callback()
}
</script>

<template>
  <button
    type="button"
    class="button--bordered my-profile-menu-button"
    @click.stop.self="open"
  >
    <span>{{ $t("settings") }}</span>
    <SVGIcon :name="state.display ? 'cursorUp' : 'cursorDown'" />

    <Popover
      v-if="state.display"
      class="my-profile-menu-popover"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- 外部公開状態トグル -->
        <button
          type="button"
          @click.stop="select(() => emit('toggleNoUnauthenticated'))"
        >
          <SVGIcon :name="hasNoUnauthenticated ? 'earthOff' : 'earth'" />
          <div class="my-profile-menu-popover__text">
            <span>{{ $t("unauthenticatedSetting") }}</span>
            <div
              class="tag--link my-profile-menu-popover__state"
              :data-color="hasNoUnauthenticated ? undefined : 'accent'"
            >
              <span>{{ $t(hasNoUnauthenticated ? "authenticated" : "unauthenticated") }}</span>
            </div>
          </div>
        </button>

        <!-- おすすめへの表示トグル（状態がわからない間は誤った値を書き込まないよう無効にする） -->
        <button
          type="button"
          :disabled="hideFromAlgorithmicRecommendations == null"
          @click.stop="select(() => emit('toggleHideFromAlgorithmicRecommendations'))"
        >
          <SVGIcon :name="hideFromAlgorithmicRecommendations ? 'eyeOff' : 'eye'" />
          <div class="my-profile-menu-popover__text">
            <span>{{ $t("algorithmicRecommendationSetting") }}</span>
            <div
              v-if="hideFromAlgorithmicRecommendations != null"
              class="tag--link my-profile-menu-popover__state"
              :data-color="hideFromAlgorithmicRecommendations ? 'notice' : undefined"
            >
              <span>{{ $t(hideFromAlgorithmicRecommendations ? "algorithmicRecommendationRefused" : "algorithmicRecommendationAllowed") }}</span>
            </div>
          </div>
        </button>

        <!-- アクターステータス編集ポップアップトリガー -->
        <button
          type="button"
          @click.stop="select(() => emit('openActorStatusEditPopup'))"
        >
          <SVGIcon name="video" />
          <div class="my-profile-menu-popover__text">
            <span>{{ $t("actorStatusLiveEdit") }}</span>
            <div
              class="tag--link my-profile-menu-popover__state"
              :data-color="hasLive ? 'red' : undefined"
            >
              <span>{{ $t(hasLive ? "actorStatusLiveOn" : "actorStatusLiveOff") }}</span>
            </div>
          </div>
        </button>

        <!-- 購読許可設定ポップアップトリガー -->
        <button
          type="button"
          @click.stop="select(() => emit('openActivitySubscriptionPermissionPopup'))"
        >
          <SVGIcon name="bell" />
          <div class="my-profile-menu-popover__text">
            <span>{{ $t("activitySubscriptionPermission") }}</span>
            <div
              class="tag--link my-profile-menu-popover__state"
              :data-color="allowSubscriptionsColor"
            >
              <span>{{ $t(`allowSubscription-${allowSubscriptions}`) }}</span>
            </div>
          </div>
        </button>
      </menu>
    </Popover>
  </button>
</template>

<style lang="scss" scoped>
// 編集ボタンに合わせる
.my-profile-menu-button {
  & > span {
    font-size: 0.875rem;
  }

  & > .svg-icon {
    font-size: 1rem;
  }
}

.my-profile-menu-popover:deep() {
  & > .popover__content {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
}

// 項目が 2 段になるので、アイコンは 1 段目の高さに揃える
.list-menu > button {
  align-items: flex-start;

  & > .svg-icon {
    // 1 段目の行の高さ（`--line-height-high`）の中央に置く
    margin-top: calc((var(--line-height-high) * 1em - 1em) / 2);
  }

  // 配信ステータスは状態を項目に書くので、アイコンは他の項目と同じ色にする
  & > .svg-icon--video {
    --icon-color: var(--fg-color);
  }
}

// 状態ラベルは項目名の下の段に置く（長い訳文で項目名と並べると見切れるため）
.my-profile-menu-popover__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  grid-gap: 0.25em;
  min-width: 0;

  & > span {
    color: rgb(var(--fg-color), 0.875);
    line-height: var(--line-height-high);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 状態ラベル（プロフィールのラベルタグに合わせる）
.my-profile-menu-popover__state {
  --alpha: 0.75;
  --color: var(--fg-color);
  font-size: 0.75rem;
  max-width: 100%;
  &[data-color="accent"] {
    // プロフィールのラベルタグの「公開中」に合わせる
    --alpha: 1.0;
    --color: var(--accent-color);
  }
  &[data-color="red"] {
    --color: var(--red-color);
  }
  &[data-color="yellow"] {
    --color: var(--yellow-color);
  }
  &[data-color="notice"] {
    --color: var(--notice-color);
  }

  & > span {
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
