<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

defineProps<{
  hasDeleteButton: boolean;
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  sessionGroups: ComputedRef<{ [service: string]: Array<TTSession> }>;
}>({
  sessionGroups: computed(() => {
    const sessionValues =
      Object.values(mainState.atp.data.sessions)
        .sort((a: TTSession, b: TTSession) => {
          const aKey = `${a.__service} ${a.handle}`
          const bKey = `${b.__service} ${b.handle}`
          return aKey < bKey ? - 1 : aKey > bKey ? 1 : 0
        })
    const results: { [service: string]: Array<TTSession> } = {}
    sessionValues.forEach((session: TTSession) => {
      if (results[session.__service as string] == null)
        results[session.__service as string] = []
      results[session.__service as string].push(session)
    })
    return results
  }),
})

async function login (session: TTSession) {
  Util.blurElement()
  mainState.atp.data.did = session.did
  mainState.atp.saveData()
  location.reload()
}

async function deleteAccount (session: TTSession) {
  Util.blurElement()
  const result = await mainState.openConfirmationPopup($t("removeAccountHistory"), $t("removeAccountHistoryMessage"))
  if (result) mainState.atp.deleteAccount(session.did)
}

function getDidColor (did: string): string {
  return "#" + Util.encryptMD5(did).split("").splice(0, 6).join("")
}
</script>

<template>
  <div class="account-list">
    <div
      v-for="sessions, service in state.sessionGroups"
      :key="service"
      class="account-list__service"
    >
      <div class="service">{{ service }}</div>
      <div class="account-button-container">
        <div
          v-for="session of sessions"
          :key="session.did"
          class="account-button"
          :data-is-me="mainState.atp.session?.did === session.did"
        >
          <div
            class="account-button__left"
            @click.prevent="login(session)"
          >
            <img
              class="account-button__image"
              src="/img/void-avatar.png"
              alt=""
              :style="{ '--color': getDidColor(session.did) }"
            >
            <div class="account-button__handle">{{ session.handle }}</div>
            <div class="account-button__email">{{ session.email }}</div>
          </div>
          <div
            v-if="hasDeleteButton"
            class="account-button__right"
          >
            <button
              class="account-button__delete"
              @click.prevent="deleteAccount(session)"
            >
              <SVGIcon name="cross" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-list {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;

  &__service {
    border: 1px solid rgba(var(--fg-color), 0.125);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
  }
}

.service {
  border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  color: rgba(var(--fg-color), 0.75);
  padding: 0.5rem;
}

.account-button-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
  padding: 0.5rem;
}

.account-button {
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
      "i e";
    grid-gap: 0 0.5rem;
    align-items: center;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    &:focus, &:hover {
      border-color: rgba(var(--fg-color), 0.5);
    }
  }
  &[data-is-me="true"] &__left {
    background-color: rgba(var(--accent-color), 0.25);
  }

  &__image {
    background-image: radial-gradient(closest-corner, transparent, var(--color));
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

  &__email {
    grid-area: e;
    color: rgba(var(--fg-color), 0.75);
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
    margin-right: -0.5rem;
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
