<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

defineProps<{
  hasDeleteButton: boolean;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  sortedSessions: ComputedRef<Array<TTSession>>;
}>({
  sortedSessions: computed(() => {
    const sessionValues = Object.values(mainState.atp.data.sessions)
      .sort((a: TTSession, b: TTSession) => {
        const aKey = `${a.__service} ${a.handle}`
        const bKey = `${b.__service} ${b.handle}`
        return aKey < bKey ? - 1 : aKey > bKey ? 1 : 0
      })
    return sessionValues
  }),
})

async function login (session: TTSession) {
  blurElement()
  mainState.atp.data.did = session.did
  mainState.atp.saveData()
  location.reload()
}

function deleteAccount (session: TTSession) {
  blurElement()
  mainState.atp.logout(session.did)
  if (mainState.atp.session?.did === session.did) location.reload()
}

function getDidColor (did: string): string {
  return "#" + did
    .replace("did:plc:", "")
    .split("")
    .map(c => c.charCodeAt(0).toString(16))
    .join("")
    .split("")
    .splice(0, 6)
    .join("")
}
</script>

<template>
  <div class="account-list">
    <div
      v-for="session in state.sortedSessions"
      class="account"
      :data-is-me="mainState.atp.session?.did === session.did"
    >
      <div
        class="account__left"
        @click.prevent="login(session)"
      >
        <img
          class="account__image"
          src="/img/void-avatar.png"
          :style="{ '--color': getDidColor(session.did) }"
        >
        <div class="account__handle">{{ session.handle }}</div>
        <div class="account__service">{{ session.__service }}</div>
      </div>
      <div
        v-if="hasDeleteButton"
        class="account__right"
      >
        <button
          class="account__delete"
          @click.prevent="deleteAccount(session)"
        >
          <SVGIcon name="cross" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-list {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.account {
  display: flex;

  &__left {
    border: 1px solid rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
    cursor: pointer;
    display: grid;
    flex-grow: 1;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "i h"
      "i s";
    grid-gap: 0.25rem 0.5rem;
    align-items: center;
    padding: 0.5rem 1rem 0.5rem 0.5rem;
    &:focus, &:hover {
      border-color: rgba(var(--fg-color), 0.5);
    }
  }
  &[data-is-me="true"] &__left {
    background-color: rgba(var(--accent-color), 0.125);
  }

  &__image {
    background-image: radial-gradient(closest-side, transparent, var(--color));
    border-radius: var(--border-radius);
    grid-area: i;
    width: 3rem;
    height: 3rem;
  }

  &__handle {
    grid-area: h;
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__service {
    grid-area: s;
    font-size: 0.875rem;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delete {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -1rem;
    min-width: 3rem;
    min-height: 3rem;

    & > .svg-icon {
      fill: rgba(var(--notice-color), 0.75);
    }
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}
</style>
