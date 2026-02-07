<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  session: TTSession
  isAtLoginPopup: boolean
}>()

const mainState = inject("state") as MainState

async function login () {
  Util.blurElement()
  mainState.mounted = false
  const switched = mainState.mySession?.switchAccount(props.session.did)
  if (!switched) {
    mainState.openErrorPopup("Session not found", "AccountButton/login")
    mainState.mounted = true
    return
  }
  window.scrollTo(0, 0)
  location.reload()
}

function getDidColor (did: string): string {
  return "#" + Util.encryptMD5(did).split("").splice(0, 6).join("")
}

function openAccountPopover ($event: Event) {
  mainState.accountPopoverProps.session = props.session
  mainState.accountPopoverProps.isAtLoginPopup = props.isAtLoginPopup
  mainState.openAccountPopover($event.target)
}
</script>

<template>
  <div
    class="account-button"
    :data-is-me="mainState.atp.session?.did === session.did"
    @click.prevent="login"
  >
    <!-- アバター -->
    <div
      class="account-button__image"
      :style="{ '--color': getDidColor(session.did) }"
    >
      <SVGIcon
        v-if="session.__avatar == null"
        name="shimmer"
      />
      <LazyImage
        v-else
        :src="session.__avatar"
        :data-has-avatar="session.__avatar != null"
      />
    </div>

    <!-- ハンドル -->
    <div
      class="account-button__handle"
      translate="no"
    >{{ session.handle }}</div>

    <!-- アカウントステータス -->
    <div class="account-button__status">
      <!-- 認証形式 -->
      <SVGIcon :name="session.__authType === 'oauth' ? 'alphaACircle' : 'alphaPCircle'" />

      <!-- 2FA -->
      <SVGIcon
        v-if="session.emailAuthFactor"
        name="twoFactorAuthentication"
      />

      <!-- メールアドレス確認状態 -->
      <SVGIcon :name="!session.emailConfirmed ? 'emailLock' : 'emailCheck'" />

      <span
        class="account-button__status__email"
        translate="no"
      >{{ session.email }}</span>
    </div>

    <!-- アカウントポップオーバートリガー -->
    <button
      type="button"
      class="menu-button"
      @click.prevent.stop="openAccountPopover($event)"
    >
      <SVGIcon name="menu" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.account-button {
  --color: var(--fg-color);
  background-clip: padding-box;
  background-color: rgb(var(--bg-color));
  border: 1px solid rgb(var(--fg-color), 0.25);
  border-bottom-style: none;
  cursor: pointer;
  display: grid;
  flex-grow: 1;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    "i h m"
    "i e m";
  grid-gap: 0.125em 0.5rem;
  align-items: center;
  overflow: hidden;
  &:focus, &:hover {
    --color: var(--accent-color);
    --green-color: var(--accent-color);
  }
  &[data-is-me="true"] {
    background-color: rgb(var(--accent-color), 0.25);
  }
  &:first-child:not(:last-child) {
    border-radius: var(--border-radius-middle) var(--border-radius-middle) 0 0;
  }
  &:last-child:not(:first-child) {
    border-bottom-style: solid;
    border-radius: 0 0 var(--border-radius-middle) var(--border-radius-middle);
  }
  &:first-child:last-child {
    border-bottom-style: solid;
    border-radius: var(--border-radius-middle);
  }
  &:not(:first-child) {
    border-top-color: rgb(var(--fg-color), 0.125);
  }

  // アバター
  &__image {
    background-color: var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    grid-area: i;
    width: 3rem;
    height: 3rem;

    & > .svg-icon {
      fill: #ffffff;
      font-size: 1.5rem;
    }

    & > .lazy-image {
      background-color: unset;
      &[data-has-avatar="false"] {
        filter: brightness(200%);
      }
    }
  }

  // ハンドル
  &__handle {
    grid-area: h;
    color: rgb(var(--color));
    align-self: end;
    font-weight: bold;
    line-height: var(--line-height-low);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // アカウントステータス
  &__status {
    grid-area: e;
    color: rgb(var(--color), 0.75);
    display: flex;
    align-self: start;
    align-items: center;
    grid-gap: 0.25rem;
    font-size: 0.875rem;
    overflow: hidden;

    .svg-icon {
      fill: rgb(var(--color), 0.75);
      line-height: var(--line-height-low);
    }

    // 望ましいアイコンの色
    .svg-icon--alphaACircle,
    .svg-icon--twoFactorAuthentication,
    .svg-icon--emailCheck {
      fill: rgb(var(--green-color));
    }

    &__email {
      line-height: var(--line-height-low);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // アカウントポップオーバートリガー
  .menu-button {
    grid-area: m;
    cursor: pointer;
    padding: 0 1em;
    position: relative;
    height: calc(100% + 2px);
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--fg-color));
      }
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
      pointer-events: none;
    }
  }
}
</style>
