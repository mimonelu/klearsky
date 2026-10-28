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

// インシデントとメンテナンスを同じ形で並べる
const events = computed((): Array<{
  name?: string
  status?: string
  message?: string
  details: Array<string>
  url?: string
}> => {
  const summary = myServiceStatus.summary
  return [
    ...(summary?.activeIncidents ?? []).map((incident) => {
      return {
        name: incident.name,
        status: incident.impact,
        message: incident.lastUpdate?.message?.trim() || undefined,
        details: [incident.status, formatEventDate(incident.started)]
          .filter((detail): detail is string => detail != null),
        url: incident.url,
      }
    }),
    ...(summary?.activeMaintenances ?? []).map((maintenance) => {
      return {
        name: maintenance.name,
        status: "UNDERMAINTENANCE",
        details: [maintenance.status, formatEventDate(maintenance.start)]
          .filter((detail): detail is string => detail != null),
        url: maintenance.url,
      }
    }),
  ]
})

// 日時として解釈できれば他の日時表示と同じ形式に整え、できなければそのまま返す
// NOTICE: 日時の形式はドキュメントの例（独自形式）と実際の応答（ISO 8601）で異なる。無効な日時を `formatDate` に渡すと例外になる
function formatEventDate (value?: string): undefined | string {
  if (!value) {
    return
  }
  return Number.isNaN(new Date(value).getTime())
    ? value
    : mainState.formatDate(value)
}

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
      <!-- 全体の状態。初回の取得中は状態が分からないため表示しない -->
      <div
        v-if="myServiceStatus.error || myServiceStatus.summary?.page?.status != null"
        class="service-status-popup__overview"
        :data-status="myServiceStatus.error ? 'ERROR' : myServiceStatus.summary?.page?.status"
      >
        <SVGIcon :name="!myServiceStatus.error && !myServiceStatus.hasIssue ? 'check' : 'alert'" />
        <div class="service-status-popup__overview__body">
          <div
            v-if="myServiceStatus.error"
            class="service-status-popup__overview__status"
          >{{ $t("apiError") }}</div>
          <div
            v-else-if="myServiceStatus.summary?.page?.status != null"
            class="service-status-popup__overview__status"
            translate="no"
          >{{ myServiceStatus.summary.page.status }}</div>
          <div
            v-if="fetchedAt"
            class="service-status-popup__overview__fetched-at"
            translate="no"
          >{{ fetchedAt }}</div>
        </div>
      </div>

      <!-- 進行中のインシデント・メンテナンス -->
      <div
        v-if="events.length > 0"
        class="service-status-popup__events"
      >
        <!-- URL がない場合はリンクにしない（押すと不正な URL のエラーになるため） -->
        <component
          v-for="event, eventIndex of events"
          :key="eventIndex"
          :is="event.url != null ? 'a' : 'div'"
          class="service-status-popup__event"
          :data-link="event.url != null"
          :href="Util.safeExternalUrl(event.url)"
          :rel="event.url != null ? 'noreferrer' : undefined"
          :target="event.url != null ? '_blank' : undefined"
          @click="event.url != null && onClickExternalLink($event, event.url)"
        >
          <div
            class="service-status-popup__event__name"
            translate="no"
          >{{ event.name }}</div>
          <div
            v-if="event.message != null"
            class="service-status-popup__event__message"
          >{{ event.message }}</div>
          <div
            class="service-status-popup__event__detail"
            translate="no"
          >
            <span
              v-if="event.status != null"
              class="service-status-popup__badge"
              :data-status="event.status"
            >{{ event.status }}</span>
            <span
              v-for="detail, detailIndex of event.details"
              :key="detailIndex"
            >{{ detail }}</span>
          </div>
        </component>
      </div>

      <!-- コンポーネント -->
      <ul
        v-if="componentGroups.length > 0"
        class="service-status-popup__groups"
      >
        <li
          v-for="group, groupIndex of componentGroups"
          :key="groupIndex"
          class="service-status-popup__group"
        >
          <div class="service-status-popup__component service-status-popup__component--parent">
            <span
              class="service-status-popup__component__name"
              translate="no"
            >{{ group.parent.name }}</span>
            <span
              class="service-status-popup__badge"
              :data-status="group.parent.status"
              translate="no"
            >{{ group.parent.status }}</span>
          </div>
          <div
            v-for="component, componentIndex of group.children"
            :key="componentIndex"
            class="service-status-popup__component"
          >
            <span
              class="service-status-popup__component__name"
              translate="no"
            >{{ component.name }}</span>
            <span
              class="service-status-popup__badge"
              :data-status="component.status"
              translate="no"
            >{{ component.status }}</span>
          </div>
        </li>
      </ul>

      <!-- ステータスページへのリンク -->
      <a
        class="service-status-popup__link"
        :href="CONSTS.SERVICE_STATUS_URL"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="openInNew" />
        <span translate="no">{{ CONSTS.SERVICE_STATUS_URL }}</span>
      </a>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
// 状態ごとの色
@mixin status-color () {
  --status-color: var(--fg-color);
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
  &[data-status="MAJOROUTAGE"],
  &[data-status="ERROR"] {
    --status-color: var(--notice-color);
  }
}

.service-status-popup {
  &:deep() {
    .popup-body {
      grid-gap: 1rem;
      padding: 0;
    }
  }

  // 更新ボタン
  &__update-button {
    position: absolute;
    left: 0.5rem;
  }

  // 全体の状態
  &__overview {
    @include status-color;
    background-color: rgb(var(--status-color), 0.125);
    display: flex;
    align-items: center;
    grid-gap: 1rem;
    padding: 1rem;

    & > .svg-icon {
      fill: rgb(var(--status-color));
      font-size: 1.75rem;
    }

    &__body {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    &__status {
      color: rgb(var(--status-color));
      font-size: 1.25rem;
      font-weight: bold;
      line-height: var(--line-height-low);
      word-break: break-word;
    }

    &__fetched-at {
      font-size: 0.875rem;
      line-height: var(--line-height-low);
    }
  }

  // 状態のバッジ
  &__badge {
    @include status-color;
    background-color: rgb(var(--status-color), 0.125);
    border-radius: var(--border-radius-large);
    color: rgb(var(--status-color));
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: bold;
    line-height: var(--line-height-low);
    padding: 0.25rem 0.5rem;
    white-space: nowrap;
  }

  // インシデント・メンテナンス
  &__events {
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
  }

  &__event {
    background-color: rgb(var(--accent-color), 0.0625);
    border: 1px solid rgb(var(--accent-color), 0.25);
    border-radius: var(--border-radius-middle);
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    margin: 0 1rem;
    padding: 0.75rem 1rem;
    &[data-link="true"] {
      cursor: pointer;
      &:focus, &:hover {
        background-color: rgb(var(--accent-color), 0.125);
        border: 1px solid rgb(var(--accent-color), 0.375);
      }
    }

    &__name {
      font-weight: bold;
      line-height: var(--line-height-low);
      word-break: break-word;
    }

    &__message {
      color: rgb(var(--fg-color), 0.75);
      font-size: 0.875rem;
      line-height: var(--line-height-high);
      white-space: pre-wrap;
      word-break: break-word;
    }

    &__detail {
      color: rgb(var(--fg-color), 0.75);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      grid-gap: 0.25rem 0.5rem;
      font-size: 0.875rem;

      & > span {
        line-height: var(--line-height-low);
      }
    }
  }

  // コンポーネント
  &__groups {
    display: flex;
    flex-direction: column;
    grid-gap: 1rem;
    margin: 0 1rem;
  }

  &__group {
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
  }

  &__component {
    border-bottom: 1px solid rgb(var(--fg-color), 0.125);
    display: flex;
    align-items: center;
    justify-content: space-between;
    grid-gap: 1rem;
    padding: 0 0 0.25rem 1rem;

    &--parent {
      font-weight: bold;
      padding-left: 0;
    }

    &__name {
      line-height: var(--line-height-low);
      word-break: break-word;
    }
  }

  // ステータスページへのリンク
  &__link {
    align-self: center;
    color: rgb(var(--accent-color));
    cursor: pointer;
    display: flex;
    align-items: center;
    grid-gap: 0.375rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    &:focus, &:hover {
      text-decoration: underline;
      text-underline-offset: 0.25em;
    }

    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }

    & > span {
      line-height: var(--line-height-low);
    }
  }
}
</style>
