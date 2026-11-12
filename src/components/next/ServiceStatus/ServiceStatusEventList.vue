<script lang="ts" setup>
import { computed, inject } from "vue"
import Util from "@/composables/util"
import { useSafeExternalUrl } from "@/composables/util/use-safe-external-url"
import CONSTS from "@/consts/consts.json"

// 進行中のインシデントとメンテナンスの一覧
const props = defineProps<{
  summary?: TTServiceStatusSummary

  // インシデントとメンテナンスがない時に、全体の状態を 1 件として表示するか
  pageStatusFallback?: boolean
}>()

const mainState = inject("state") as MainState

const { onClickExternalLink } = useSafeExternalUrl()

// インシデントとメンテナンスを同じ形で並べる
const events = computed((): Array<{
  name?: string
  status?: string
  message?: string
  details: Array<string>
  url?: string
}> => {
  const summary = props.summary
  const items = [
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
  if (items.length === 0 && props.pageStatusFallback && summary?.page?.status != null) {
    items.push({
      name: undefined,
      status: summary.page.status,
      details: [],
      url: CONSTS.SERVICE_STATUS_URL,
    })
  }
  return items
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
</script>

<template>
  <div
    v-if="events.length > 0"
    class="service-status-event-list"
  >
    <!-- URL がない場合はリンクにしない（押すと不正な URL のエラーになるため） -->
    <component
      v-for="event, eventIndex of events"
      :key="eventIndex"
      :is="event.url != null ? 'a' : 'div'"
      class="service-status-event"
      :data-link="event.url != null"
      :href="Util.safeExternalUrl(event.url)"
      :rel="event.url != null ? 'noreferrer' : undefined"
      :target="event.url != null ? '_blank' : undefined"
      @click="event.url != null && onClickExternalLink($event, event.url)"
    >
      <div
        v-if="event.name != null"
        class="service-status-event__name"
        translate="no"
      >{{ event.name }}</div>
      <div
        v-if="event.message != null"
        class="service-status-event__message"
      >{{ event.message }}</div>
      <div
        class="service-status-event__detail"
        translate="no"
      >
        <span
          v-if="event.status != null"
          class="service-status-event__badge"
          :data-status="event.status"
        >{{ event.status }}</span>
        <span
          v-for="detail, detailIndex of event.details"
          :key="detailIndex"
        >{{ detail }}</span>
      </div>
    </component>
  </div>
</template>

<style lang="scss" scoped>
.service-status-event-list {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}

.service-status-event {
  background-color: rgb(var(--accent-color), 0.0625);
  border: 1px solid rgb(var(--accent-color), 0.25);
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  grid-gap: 0.25rem;
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

  &__badge {
    @include service-status-badge;
  }
}
</style>
