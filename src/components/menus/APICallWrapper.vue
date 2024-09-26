<script lang="ts" setup>
import { inject, nextTick, reactive, ref } from "vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  user: TTUser
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

async function activate (type: string) {
  emit("close")
  if (mainState.atp.agent == null) {
    return
  }
  let response: Error | undefined | Response = undefined
  mainState.loaderDisplay = true
  switch (type) {
    case "getRecommendedDidCredentials": {
      response = await mainState.atp.agent.com.atproto.identity
        .getRecommendedDidCredentials()
          .then((value) => value)
          .catch((error) => error)
      break
    }
    case "resolveHandle": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.identity.resolveHandle",
        props.user.did,
        { handle: props.user.handle }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    case "describeRepo": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.repo.describeRepo",
        props.user.did,
        { repo: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    case "listMissingBlobs": {
      response = await mainState.atp.agent.com.atproto.repo
        .listMissingBlobs()
          .then((value) => value)
          .catch((error) => error)
      break
    }
    case "listRecords": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.repo.listRecords",
        props.user.did,
        {
          collection: "app.bsky.feed.post",
          repo: props.user.did,
        }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    case "checkAccountStatus": {
      response = await mainState.atp.agent.com.atproto.server
        .checkAccountStatus()
          .then((value) => value)
          .catch((error) => error)
      break
    }
    /* NOTICE: 重量過多のためコメントアウト
    case "getCheckout": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.getCheckout",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    */
    case "getHead": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.getHead",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    case "getLatestCommit": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.getLatestCommit",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    /* NOTICE: 重量過多のためコメントアウト
    case "getRepo": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.getRepo",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    */
    case "listBlobs": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.listBlobs",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
    case "listRepos": {
      response = await mainState.atp.fetchWithoutAgent(
        "com.atproto.sync.listBlobs",
        props.user.did,
        { did: props.user.did }
      )
        .then((value) => value)
        .catch((error) => error)
      break
    }
  }
  mainState.loaderDisplay = false
  if (response == null) {
    mainState.openErrorPopup("apiError", "APICallWrapper/activate")
    return
  }
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "APICallWrapper/activate")
    return
  }
  if (response instanceof Response) {
    response = await response.json()
  }
  Util.displayJson(response)
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
    <span>{{ $t("callApi") }}</span>

    <!-- APIコールメニュー -->
    <Popover
      v-if="state.display"
      ref="popover"
      @close="close"
    >
      <menu class="list-menu">
        <!-- resolveHandle -->
        <button @click.prevent.stop="activate('resolveHandle')">
          <SVGIcon name="at" />
          <span>resolveHandle</span>
        </button>

        <!-- describeRepo -->
        <button @click.prevent.stop="activate('describeRepo')">
          <SVGIcon name="at" />
          <span>describeRepo</span>
        </button>

        <!-- listRecords -->
        <button @click.prevent.stop="activate('listRecords')">
          <SVGIcon name="at" />
          <span>listRecords (post)</span>
        </button>

        <!-- getCheckout -->
        <!-- NOTICE: 重量過多のためコメントアウト
        <button @click.prevent.stop="activate('getCheckout')">
          <SVGIcon name="at" />
          <span>getCheckout</span>
        </button>
        -->

        <!-- getHead -->
        <button @click.prevent.stop="activate('getHead')">
          <SVGIcon name="at" />
          <span>getHead</span>
        </button>

        <!-- getLatestCommit -->
        <button @click.prevent.stop="activate('getLatestCommit')">
          <SVGIcon name="at" />
          <span>getLatestCommit</span>
        </button>

        <!-- getRepo -->
        <!-- NOTICE: 重量過多のためコメントアウト
        <button @click.prevent.stop="activate('getRepo')">
          <SVGIcon name="at" />
          <span>getRepo</span>
        </button>
        -->

        <!-- listBlobs -->
        <button @click.prevent.stop="activate('listBlobs')">
          <SVGIcon name="at" />
          <span>listBlobs</span>
        </button>

        <!-- listRepos -->
        <button @click.prevent.stop="activate('listRepos')">
          <SVGIcon name="at" />
          <span>listRepos</span>
        </button>

        <template v-if="user.did === mainState.atp.data.did">
          <div class="list-menu__header">Yours</div>
          <hr />

          <!-- getRecommendedDidCredentials -->
          <button @click.prevent.stop="activate('getRecommendedDidCredentials')">
            <SVGIcon name="at" />
            <span>getRecommendedDidCred.</span>
          </button>

          <!-- listMissingBlobs -->
          <button @click.prevent.stop="activate('listMissingBlobs')">
            <SVGIcon name="at" />
            <span>listMissingBlobs</span>
          </button>

          <!-- checkAccountStatus -->
          <button @click.prevent.stop="activate('checkAccountStatus')">
            <SVGIcon name="at" />
            <span>checkAccountStatus</span>
          </button>
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
