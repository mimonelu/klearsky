<script lang="ts" setup>
import { computed, inject, onMounted, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import MenuTickerCopyTextWrapper from "@/components/menus/CopyTextWrapper.vue"
import MenuTickerOpenAppWrapper from "@/components/menus/OpenAppWrapper.vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import MenuTickerSendLinkCard from "@/components/menus/SendLinkCard.vue"
import MenuTickerTranslateText from "@/components/menus/TranslateText.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const router = useRouter()

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  display: boolean
  starterPack?: TIStarterPack
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  isMuted: ComputedRef<boolean>
  isBlocked: ComputedRef<boolean>
  isOwn: ComputedRef<boolean>
}>({
  isMuted: computed((): boolean => {
    return props.starterPack?.creator?.viewer?.muted ?? false
  }),
  isBlocked: computed((): boolean => {
    return props.starterPack?.creator?.viewer?.blocked != null
  }),
  isOwn: computed((): boolean => {
    return props.starterPack?.creator.did === mainState.atp.session?.did
  }),
})

async function shareStarterPack () {
  Util.blurElement()
  emit("close")
  if (props.starterPack == null) {
    return
  }
  mainState.loaderDisplay = true
  const sharedUrl = await mainState.atp.fetchStarterPackSharedUrl(props.starterPack)
  mainState.loaderDisplay = false
  if (sharedUrl instanceof Error) {
    mainState.openErrorPopup(sharedUrl, "StarterPackCardPopover/shareStarterPack")
    return
  }
  await navigator.clipboard.writeText(sharedUrl)
}

async function editStarterPack () {
  Util.blurElement()
  emit("close")
  if (mainState.starterPackCardPopoverCallback != null) {
    await mainState.starterPackCardPopoverCallback("editStarterPack")
  }
}

async function deleteStarterPack () {
  Util.blurElement()
  emit("close")
  const isConfirmed = await mainState.openConfirmationPopup({
    title: $t("starterPackDelete"),
    text: $t("starterPackDeleteMessage"),
  })
  if (isConfirmed && mainState.starterPackCardPopoverCallback != null) {
    await mainState.starterPackCardPopoverCallback("deleteStarterPack")
  }
}

async function moveToList (type: "feeds" | "users") {
  Util.blurElement()
  emit("close")
  if (props.starterPack == null) {
    return
  }
  await router.push({
    name: `list-${type}-home`,
    query: {
      list: props.starterPack.list?.uri ?? props.starterPack.record.list,
      displayName: props.starterPack.record.name,
    }
  })
}

const popover = ref(null)

onMounted(open)

function open () {
  Util.blurElement()
  if (popover.value == null) {
    return
  }
  ;(popover.value as typeof Popover).open(
    mainState.starterPackCardPopoverSelector,
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
</script>

<template>
  <Popover
    class="starter-pack-card-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="starterPack != null"
      class="list-menu"
    >
      <!-- スターターパックの短縮URLをコピー -->
      <button @click.prevent.stop="shareStarterPack">
        <SVGIcon name="clipboard" />
        <span>{{ $t("starterPackShare") }}</span>
      </button>

      <!-- スターターパックを編集する -->
      <button
        v-if="state.isOwn"
        @click.prevent.stop="editStarterPack"
      >
        <SVGIcon name="cards" />
        <span>{{ $t("starterPackEdit") }}</span>
      </button>

      <!-- スターターパックを削除する -->
      <button
        v-if="state.isOwn"
        @click.prevent.stop="deleteStarterPack"
      >
        <SVGIcon name="remove" />
        <span>{{ $t("starterPackDelete") }}</span>
      </button>

      <hr />

      <!-- リストフィードを見る -->
      <button @click.prevent.stop="moveToList('feeds')">
        <SVGIcon name="post" />
        <span>{{ $t("showStarterPackListFeeds") }}</span>
      </button>

      <!-- リストユーザーを見る -->
      <button @click.prevent.stop="moveToList('users')">
        <SVGIcon name="people" />
        <span>{{ $t("showStarterPackListUsers") }}</span>
      </button>

      <hr />

      <!-- リンクカードで投稿する -->
      <MenuTickerSendLinkCard
        :uri="starterPack.uri"
        @close="emit('close')"
      />

      <!-- テキストを翻訳する -->
      <MenuTickerTranslateText
        :text="starterPack.record.description"
        @close="emit('close')"
      />

      <!-- コピーする -->
      <MenuTickerCopyTextWrapper
        place="starterPack"
        :displayName="starterPack.record.name"
        :text="starterPack.record.description"
        :uri="starterPack.uri"
        :did="starterPack.creator.did"
        :handle="starterPack.creator.handle"
        @close="emit('close')"
      />

      <!-- 外部アプリで開く -->
      <MenuTickerOpenAppWrapper
        type="starterPack"
        :did="starterPack.creator.did"
        :handle="starterPack.creator.handle"
        :uri="starterPack.uri"
        @close="emit('close')"
      />

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="starterPack"
        @close="emit('close')"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.starter-pack-card-popover {
  &:deep() {
    & > .popover__content {
      padding: 0 0.5rem 0.5rem 0.5rem;
    }
  }
}
</style>
