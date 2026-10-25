<script lang="ts" setup>
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive } from "vue"
import { format } from "date-fns/format"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

const myServiceStatus = mainState.myServiceStatus!

// ローダーはこのポップアップからの取得中のみ表示する（定期取得のたびに表示しないため）
const state = reactive<{
  loading: boolean
}>({
  loading: false,
})

// グループ（`group` が `null` のコンポーネント）ごとに子コンポーネントをまとめる
const componentGroups = computed((): Array<{
  parent: TTServiceStatusComponent
  children: Array<TTServiceStatusComponent>
}> => {
  // `id` が欠けたコンポーネントは親子関係を判定できないため、親として扱う
  const components = myServiceStatus.components
  const isChild = (component: TTServiceStatusComponent): boolean => {
    const groupId = component.group?.id
    return groupId != null && components.some((parent) => parent.id === groupId)
  }
  return components
    .filter((component) => !isChild(component))
    .map((parent) => {
      return {
        parent,
        children: parent.id == null
          ? []
          : components.filter((component) => component.group?.id === parent.id),
      }
    })
})

const fetchedAt = computed((): string => {
  const date = myServiceStatus.fetchedAt
  return date != null ? format(date, "yyyy/MM/dd HH:mm:ss") : ""
})

onBeforeMount(async () => {
  myServiceStatus.markIncidentsAsSeen()
  await update()
})

// 表示中に届いたインシデントも確認済みにする
onBeforeUnmount(() => {
  myServiceStatus.markIncidentsAsSeen()
})

function close () {
  emit("close")
}

// NOTICE: 取得中でも取得し直す。開く直前に始まった定期取得はコンポーネントを取得しない場合があるため
// 古い方の結果は世代番号で破棄される
async function update () {
  if (state.loading) {
    return
  }
  state.loading = true
  await myServiceStatus.update()
  state.loading = false
  myServiceStatus.markIncidentsAsSeen()
}
</script>

<template>
  <Popup
    class="service-status-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.loading"
    @close="close"
  >
    <template #header>
      <h2>
        <!-- 更新ボタン -->
        <button
          type="button"
          class="button--bordered service-status-popup__update-button"
          @click.prevent="update"
        >
          <SVGIcon name="refresh" />
        </button>

        <SVGIcon name="pulse" />
        <span>{{ $t("serviceStatus") }}</span>
      </h2>
    </template>
    <template #body>
      <!-- 全体の状態 -->
      <div class="service-status-popup__overview">
        <div
          v-if="myServiceStatus.error"
          class="textlabel"
        >
          <div class="textlabel__text--alert">
            <SVGIcon name="alert" />{{ $t("apiError") }}
          </div>
        </div>
        <div
          v-else-if="myServiceStatus.summary?.page?.status != null"
          class="service-status-popup__status"
          :data-status="myServiceStatus.summary.page.status"
        >{{ myServiceStatus.summary.page.status }}</div>
        <div class="service-status-popup__fetched-at">{{ fetchedAt }}</div>
      </div>

      <!-- 進行中のインシデント -->
      <div
        v-for="incident, incidentIndex of myServiceStatus.summary?.activeIncidents ?? []"
        :key="incidentIndex"
        class="service-status-popup__event"
      >
        <a
          class="textlink service-status-popup__event__name"
          :href="Util.safeExternalUrl(incident.url)"
          rel="noreferrer"
          target="_blank"
          @click="onClickExternalLink($event, incident.url)"
        >
          <span>{{ incident.name }}</span>
        </a>
        <div class="service-status-popup__event__detail">
          <span
            class="service-status-popup__status"
            :data-status="incident.impact"
          >{{ incident.impact }}</span>
          <span>{{ incident.status }}</span>
          <span>{{ incident.started }}</span>
        </div>
      </div>

      <!-- メンテナンス -->
      <div
        v-for="maintenance, maintenanceIndex of myServiceStatus.summary?.activeMaintenances ?? []"
        :key="maintenanceIndex"
        class="service-status-popup__event"
      >
        <a
          class="textlink service-status-popup__event__name"
          :href="Util.safeExternalUrl(maintenance.url)"
          rel="noreferrer"
          target="_blank"
          @click="onClickExternalLink($event, maintenance.url)"
        >
          <span>{{ maintenance.name }}</span>
        </a>
        <div class="service-status-popup__event__detail">
          <span
            class="service-status-popup__status"
            data-status="UNDERMAINTENANCE"
          >{{ maintenance.status }}</span>
          <span>{{ maintenance.start }}</span>
        </div>
      </div>

      <!-- コンポーネント -->
      <dl
        v-for="group, groupIndex of componentGroups"
        :key="groupIndex"
        class="service-status-popup__group"
      >
        <dt class="service-status-popup__component">
          <span class="service-status-popup__component__name">{{ group.parent.name }}</span>
          <span
            class="service-status-popup__status"
            :data-status="group.parent.status"
          >{{ group.parent.status }}</span>
        </dt>
        <dd
          v-for="component, componentIndex of group.children"
          :key="componentIndex"
          class="service-status-popup__component"
        >
          <span class="service-status-popup__component__name">{{ component.name }}</span>
          <span
            class="service-status-popup__status"
            :data-status="component.status"
          >{{ component.status }}</span>
        </dd>
      </dl>

      <!-- ステータスページへのリンク -->
      <a
        class="textlink service-status-popup__link"
        :href="CONSTS.SERVICE_STATUS_URL"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="openInNew" />
        <span>{{ CONSTS.SERVICE_STATUS_URL }}</span>
      </a>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.service-status-popup {
  // 更新ボタン
  &__update-button {
    position: absolute;
    left: 0.5rem;
  }

  &__overview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    grid-gap: 0.5rem;
  }

  &__fetched-at {
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.875rem;
  }

  // 状態
  &__status {
    --status-color: var(--fg-color);
    color: rgb(var(--status-color));
    font-size: 0.875rem;
    font-weight: bold;
    white-space: nowrap;
    &[data-status="UP"],
    &[data-status="OPERATIONAL"] {
      --status-color: var(--share-color);
    }
    &[data-status="UNDERMAINTENANCE"] {
      --status-color: var(--accent-color);
    }
    &[data-status="HASISSUES"],
    &[data-status="DEGRADEDPERFORMANCE"],
    &[data-status="PARTIALOUTAGE"] {
      --status-color: var(--label-color);
    }
    &[data-status="MAJOROUTAGE"] {
      --status-color: var(--notice-color);
    }
  }

  // インシデント・メンテナンス
  &__event {
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
    padding: 0.75rem 1rem;

    &__name {
      font-weight: bold;
      word-break: break-word;
    }

    &__detail {
      color: rgb(var(--fg-color), 0.75);
      display: flex;
      flex-wrap: wrap;
      grid-gap: 0.25rem 1rem;
      font-size: 0.875rem;
    }
  }

  // コンポーネント
  &__group {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;

    & > dt {
      font-weight: bold;
    }

    & > dd {
      padding-left: 1rem;
    }
  }

  &__component {
    display: flex;
    align-items: center;
    justify-content: space-between;
    grid-gap: 1rem;

    &__name {
      word-break: break-word;
    }
  }

  // ステータスページへのリンク
  &__link {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    align-self: flex-start;
  }
}
</style>
