<script lang="ts" setup>
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive } from "vue"
import { format } from "date-fns/format"
import Popup from "@/components/popups/Popup.vue"
import ServiceStatusEventList from "@/components/next/ServiceStatus/ServiceStatusEventList.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

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
      <ServiceStatusEventList
        class="service-status-popup__events"
        :summary="myServiceStatus.summary"
      />

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
    @include service-status-color;
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
      overflow-wrap: anywhere;
    }

    &__fetched-at {
      font-size: 0.875rem;
      line-height: var(--line-height-low);
    }
  }

  // 状態のバッジ
  &__badge {
    @include service-status-badge;
  }

  // インシデント・メンテナンス
  &__events {
    margin: 0 1rem;
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
      overflow-wrap: anywhere;
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
