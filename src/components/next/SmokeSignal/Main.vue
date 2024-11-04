<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import isBefore from "date-fns/isBefore"
import { computedAsync } from "@vueuse/core"
import Atmosphere from "@/components/next/Atmosphere/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const NUMBER_OF_FETCH_RECORDS = 5

const props = defineProps<{
  profile?: TTProfile
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  records: Ref<Array<any>>
}>({
  records: computedAsync<Array<any>>(async () => {
    if (props.profile == null) {
      return []
    }

    // プロフィールデータにキャッシュがあれば再利用
    if (props.profile.__smokeSignal != null) {
      return props.profile.__smokeSignal
    }

    // プロフィールデータのコレクションに該当レコードがなければ中止
    if (!props.profile.__repo?.collections?.includes("events.smokesignal.calendar.event")) {
      return []
    }

    const results = await mainState.atp.fetchRecords(
      props.profile.did,
      "events.smokesignal.calendar.event",
      NUMBER_OF_FETCH_RECORDS,
    )
    if (results instanceof Error) {
      return []
    }
    if (results.records == null) {
      return []
    }

    // 終了日時を過ぎているものを除く
    const dateNow = new Date()
    results.records = results.records.filter((record) => {
      return isBefore(dateNow, new Date(record.value.endsAt))
    })

    // プロフィールデータにキャッシュを保存
    props.profile.__smokeSignal = results.records

    return results.records
  }, []),
})
</script>

<template>
  <Atmosphere
    v-if="state.records.length > 0"
    class="smoke-signal"
    title="pnSmokeSignal"
    icon="https://smokesignal.events/static/favicon.ico"
    :uri="`https://smokesignal.events/${profile?.did}`"
  >
    <template #body>
      <div class="smoke-signal__container">
        <template v-for="record of state.records">
          <a
            class="smoke-signal__item"
            :href="`https://smokesignal.events/${profile?.did}/${Util.getRkey(record.uri)}`"
            rel="noreferrer"
            target="_blank"
          >
            <div class="smoke-signal__title">{{ record.value.name ?? "" }}</div>
            <div class="smoke-signal__description">{{ record.value.text ?? "" }}</div>
            <div class="smoke-signal__endsAt">
              <SVGIcon name="fire" />
              <span>{{ mainState.formatDate(record.value.startsAt, true) }} - {{ mainState.formatDate(record.value.endsAt, true) }}</span>
            </div>
          </a>
        </template>
      </div>
    </template>
  </Atmosphere>
</template>

<style lang="scss" scoped>
.smoke-signal {
  &:deep() {
    .atmosphere__body {
      display: grid;
    }
  }

  &__container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    @include scroll-bar(transparent);
  }

  &__item {
    display: grid;
    grid-template-rows: auto 1fr auto;
    flex-direction: column;
    grid-gap: 0.25rem;
    padding: 1rem;
    position: relative;

    &:not(:last-child)::after {
      border-right: 1px solid rgb(var(--blue-color), 0.5);
      content: "";
      display: block;
      position: absolute;
      right: 0;
      top: 12.5%;
      width: 1px;
      height: 75%;
    }

    // レコードが1つの場合
    &:first-child:last-child {
      min-width: 100%;
      max-width: 100%;
    }

    // レコードが2つ以上の場合（3つ目をチラ見せする）
    &:not(:first-child:last-child) {
      min-width: 75%;
      max-width: 75%;
    }
  }

  &__title {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__description {
    color: rgb(var(--fg-color), 0.75);
    flex-grow: 1;
    font-size: 0.875rem;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__endsAt {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    grid-gap: 0.25rem;
    font-size: 0.875rem;
    line-height: var(--line-height-middle);

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }

    & > span {
      color: rgb(var(--notice-color));
      font-weight: bold;
      word-break: break-word;
    }
  }
}
</style>
