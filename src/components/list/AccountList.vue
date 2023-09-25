<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import format from "date-fns/format"
import LazyImage from "@/components/common/LazyImage.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

defineProps<{
  hasDeleteButton: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  sessionCount: ComputedRef<number>
  sessionGroups: ComputedRef<{ [service: string]: Array<TTSession> }>
}>({
  sessionCount: computed((): number => {
    return Object.keys(mainState.atp.data.sessions).length
  }),
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
  const result = await mainState.openConfirmationPopup(
    $t("removeAccountHistory"),
    $t("removeAccountHistoryMessage")
  )
  if (result) mainState.atp.deleteAccount(session.did)
}

function getDidColor (did: string): string {
  return "#" + Util.encryptMD5(did).split("").splice(0, 6).join("")
}

function exportAccounts () {
  const jsonData = JSON.parse(JSON.stringify(mainState.atp.data.sessions))

  // アカウント出力から JWT を削除
  for (const did in jsonData) {
    delete jsonData[did].accessJwt
    delete jsonData[did].refreshJwt
  }

  const jsonString = JSON.stringify(jsonData, null, 2)
  const suffix = format(new Date(), "yyyyMMdd")
  Util.downloadBlob(
    [jsonString],
    { type: "application/json" },
    `klearsky-account-list-${suffix}.json`
  )
}

function importAccounts (event: Event) {
  const file = (event.target as null | any)?.files[0] ?? null
  if (file == null) return
  const reader = new FileReader()
  reader.onload = async (event: Event) => {
    const contents = (event.target as null | any)?.result ?? null
    if (contents == null) return
    const jsonData = JSON.parse(contents)
    if (jsonData == null) return
    if (!await mainState.openConfirmationPopup(
      $t("accountImport"),
      $t("accountImportNotification")
    )) return

    // 既存のセッションデータにインポートしたセッションデータを「上書き」する
    for (const did in jsonData) {
      // 現在ログイン中のデータはスキップ
      if (mainState.atp.session?.did === did) continue

      if (mainState.atp.data.sessions[did] == null) {
        mainState.atp.data.sessions[did] = jsonData[did]
      } else {
        for (const key in jsonData[did]) {
          mainState.atp.data.sessions[did][key] = jsonData[did][key]
        }
      }
    }
    Util.saveStorage("atp", mainState.atp.data)

    mainState.processing = true
    location.reload()
    mainState.processing = false
  }
  reader.readAsText(file)
}

// input[type="file"] で同一ファイルを選択すると change が発火しない仕様への対策
function onClickFileBox (event: Event) {
  if (event.target != null) (event.target as HTMLInputElement).value = ""
}
</script>

<template>
  <div class="account-list">
    <!-- マイアカウントが存在しない場合のメッセージ -->
    <div
      v-if="state.sessionCount === 0"
      class="textlabel"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noMyAccounts") }}
      </div>
    </div>

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
            <div
              class="account-button__image"
              :style="{ '--color': getDidColor(session.did) }"
            >
              <LazyImage
                :src="session.__avatar ?? '/img/void-avatar.png'"
                :data-has-avatar="session.__avatar != null"
              />
            </div>
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
    <div class="button-contaienr">
      <!-- エクスポートボタン -->
      <button
        class="button--bordered"
        :disabled="state.sessionCount === 0"
        @click.prevent="exportAccounts"
      >
        <SVGIcon name="fileExport" />
        <span>{{ $t("accountExport") }}</span>
      </button>

      <!-- インポートボタン -->
      <label
        class="button--bordered button--filebox"
      >
        <input
          type="file"
          accept=".json"
          @click="onClickFileBox"
          @change="importAccounts"
        />
        <SVGIcon name="fileImport" />
        <span>{{ $t("accountImport") }}</span>
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.account-list {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;

  &__service {
    display: grid;
    grid-gap: 0.5rem;
  }
}

.service {
  color: var(--fg-color-05);
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-button-container {
  display: flex;
  flex-direction: column;
}

.account-button {
  display: flex;
  &:first-child:not(:last-child) &__left {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }
  &:last-child:not(:first-child) &__left {
    border-bottom-style: solid;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }
  &:first-child:last-child &__left {
    border-bottom-style: solid;
    border-radius: var(--border-radius);
  }

  &__left {
    --color: var(--fg-color);
    background-clip: padding-box;
    background-color: rgb(var(--bg-color));
    border: 1px solid var(--fg-color-025);
    border-bottom-style: none;
    cursor: pointer;
    display: grid;
    flex-grow: 1;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "i h"
      "i e";
    grid-gap: 0 0.5rem;
    align-items: center;
    overflow: hidden;
    padding-right: 0.5rem;
    &:focus, &:hover {
      --color: var(--accent-color);
    }
  }
  &[data-is-me="true"] &__left {
    background-color: var(--accent-color-025);
  }

  &__image {
    background-color: var(--color);
    grid-area: i;

    & > .lazy-image {
      background-color: unset;
      width: 3rem;
      height: 3rem;
      &[data-has-avatar="false"] {
        filter: brightness(200%);
      }
    }
  }

  &__handle {
    grid-area: h;
    color: rgb(var(--color));
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    padding-top: 0.25rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__email {
    grid-area: e;
    color: rgb(var(--color), 0.75);
    font-size: 0.875rem;
    line-height: 1.25;
    overflow: hidden;
    padding-bottom: 0.25rem;
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
      fill: var(--notice-color-075);
    }
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}

.button-contaienr {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  align-items: center;

  button, label {
    padding-left: 0;
    padding-right: 0;

    .svg-icon {
      font-size: 1rem;
    }
  }
}
</style>
