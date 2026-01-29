<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { format } from "date-fns/format"
import AccountButton from "@/components/next/Account/AccountButton.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

defineProps<{
  enableSetAccountToLoginForm: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  sessionCount: ComputedRef<number>
  sessionGroups: ComputedRef<{ [service: string]: Array<TTSession> }>
}>({
  sessionCount: computed((): number => {
    return Object.keys(mainState.mySession?.sessions ?? {}).length
  }),
  sessionGroups: computed(() => {
    const sessionValues =
      Object.values(mainState.mySession?.sessions ?? {})
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

/**
 * セッションの認証タイプを推論する
 * 優先順位:
 * 1. インポートされたセッションの __authType
 * 2. 既存セッションの __authType
 * 3. デフォルトは "password"（後方互換性のため）
 */
function inferAuthType (
  importedSession: TTSession,
  existingSession?: TTSession
): "oauth" | "password" {
  return importedSession.__authType ?? existingSession?.__authType ?? "password"
}

function exportAccounts () {
  const jsonData = Util.cloneJson(mainState.mySession?.sessions ?? {})
  if (jsonData == null) return

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
    if (!await mainState.openConfirmationPopup({
      title: $t("accountImport"),
      text: $t("accountImportNotification"),
    })) return

    // 既存のセッションデータにインポートしたセッションデータを「上書き」する
    for (const did in jsonData) {
      // 現在ログイン中のデータはスキップ
      if (mainState.mySession?.did === did) continue

      const importedSession = jsonData[did] as TTSession
      const existingSession = mainState.mySession?.sessions[did]
      const authType = inferAuthType(importedSession, existingSession)

      // MySession経由でセッションを更新（カレントセッションは変更しない）
      mainState.mySession?.updateSession(
        { ...existingSession, ...importedSession },
        authType,
        importedSession.__service,
        false // switchToCurrent
      )
    }

    mainState.loaderDisplay = true
    mainState.mounted = false
    location.reload()
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
      class="textlabel account-list__no-my-accounts-message"
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
      <div
        class="service"
        translate="no"
      >{{ service }}</div>
      <div class="account-button-container">
        <AccountButton
          v-for="session of sessions"
          :key="session.did"
          :session="session"
          :enableSetAccountToLoginForm="enableSetAccountToLoginForm"
        />
      </div>

      <!-- 現在のサーバ情報 -->
      <div
        v-if="
          service === mainState.atp.session?.__service &&
          mainState.currentServerInfo?.links != null
        "
        class="server-info"
      >
        <!-- 現在のサーバ情報 - プライバシーポリシー -->
        <a
          v-if="mainState.currentServerInfo?.links?.privacyPolicy"
          class="textlink--icon"
          :href="mainState.currentServerInfo?.links?.privacyPolicy"
          rel="noreferrer"
          target="_blank"
        >
          <SVGIcon name="cursorRight" />
          <span>{{ $t("privacyPolicy") }}</span>
        </a>

        <!-- 現在のサーバ情報 - 利用規約 -->
        <a
          v-if="mainState.currentServerInfo?.links?.privacyPolicy"
          class="textlink--icon"
          :href="mainState.currentServerInfo?.links?.termsOfService"
          rel="noreferrer"
          target="_blank"
        >
          <SVGIcon name="cursorRight" />
          <span>{{ $t("termsOfService") }}</span>
        </a>
      </div>
    </div>

    <div class="button-container group-parts">
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
      <label class="button--bordered button--filebox">
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

  &__no-my-accounts-message {
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875rem;

    .svg-icon {
      fill: rgb(var(--fg-color), 0.75);
    }
  }

  &__service {
    display: grid;
    grid-gap: 0.5rem;
  }
}

.service {
  color: rgb(var(--fg-color), 0.5);
  font-weight: bold;
  line-height: var(--line-height-low);
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-button-container {
  display: flex;
  flex-direction: column;
}

// 現在のサーバ情報
.server-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  grid-gap: 0.375rem;
  margin-top: 0.25rem;
  overflow: hidden;
}

.button-container {
  & > button,
  & > label {
    flex-grow: 1;
  }
}
</style>
