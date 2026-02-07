<script lang="ts" setup>
import { inject, onMounted, ref } from "vue"
import MenuTickerOpenSource from "@/components/menus/OpenSource.vue"
import Popover from "@/components/popovers/Popover.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{
  (event: "close"): void,
  (event: "setAccountToLoginForm", session: TTSession): void,
}>()

const props = defineProps<{
  display: boolean
  session?: TTSession
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
  (popover.value as typeof Popover).open(
    mainState.accountPopoverSelector,
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

function setAccountToLoginForm () {
  Util.blurElement()
  close()
  if (props.session != null) {
    emit("setAccountToLoginForm", props.session)
  }
}

async function removeMyAccount () {
  Util.blurElement()
  close()
  if (props.session == null) {
    return
  }
  const result = await mainState.openConfirmationPopup({
    title: $t("removeAccountHistory"),
    text: $t("removeAccountHistoryMessage"),
  })
  if (result) {
    mainState.atp.deleteAccount(props.session.did)
  }
}
</script>

<template>
  <Popover
    class="account-popover"
    ref="popover"
    @close="close"
  >
    <menu
      v-if="session != null"
      class="list-menu"
    >
      <!-- ログインフォームに設定 -->
      <button
        v-if="mainState.accountPopoverProps.isAtLoginPopup"
        @click.prevent.stop="setAccountToLoginForm"
      >
        <SVGIcon :name="session.__authType === 'oauth' ? 'alphaACircle' : 'alphaPCircle'" />
        <span>{{ $t("setAccountToLoginForm") }}</span>
      </button>

      <!-- プロフィールページ -->
      <RouterLink
        v-else
        :to="{ name: 'profile-feeds', query: { account: session.did } }"
        @click="emit('close')"
      >
        <SVGIcon
          name="person"
          class="no-list-menu-color"
        />
        <span>{{ $t("profile") }}</span>
      </RouterLink>

      <hr />

      <!-- マイアカウントの削除 -->
      <button @click.prevent.stop="removeMyAccount">
        <SVGIcon name="cross" />
        <span>{{ $t("removeAccountHistory") }}</span>
      </button>

      <hr />

      <!-- ソースを表示する -->
      <MenuTickerOpenSource
        :source="session"
        @close="emit('close')"
      />
    </menu>
  </Popover>
</template>

<style lang="scss" scoped>
.account-popover {
  &:deep() {
    & > .popover__content {
      padding: 0.5rem;
    }
  }
}
</style>
