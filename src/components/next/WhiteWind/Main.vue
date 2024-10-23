<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import Atmosphere from "@/components/next/Atmosphere/Main.vue"

const NUMBER_OF_FETCH_RECORDS = 5

const props = defineProps<{
  profile?: TTProfile
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  records: Ref<Array<TICommonRecord>>
}>({
  records: computedAsync<Array<TICommonRecord>>(async () => {
    if (props.profile == null) {
      return []
    }

    // プロフィールデータにキャッシュがあれば再利用
    if (props.profile.__whiteWind != null) {
      return props.profile.__whiteWind
    }

    // プロフィールデータのコレクションに該当レコードがなければ中止
    if (!props.profile.__repo?.collections?.includes("com.whtwnd.blog.entry")) {
      return []
    }

    const results = await mainState.atp.fetchRecords(
      props.profile.did,
      "com.whtwnd.blog.entry",
      NUMBER_OF_FETCH_RECORDS,
    )
    if (results instanceof Error) {
      return []
    }

    // visibility が未設定、もしくは public のもののみ
    results.records = results.records.filter((record) => {
      if (record.value == null) {
        return false
      }
      return (
        record.value.visibility == null ||
        record.value.visibility === "public"
      )
    })

    // テンプレート構文用プロパティのインジェクション
    results.records.forEach((record) => {
      if (record.value == null) {
        record.value = {}
      }
      const partOfHref = record.uri
        .replace("at://", "")
        .replace("com.whtwnd.blog.entry/", "")
      record.value.__href = `https://whtwnd.com/${partOfHref}/${record.cid}`
      record.value.__createdAt = mainState.formatDate(record.value.createdAt)
    })

    // プロフィールデータにキャッシュを保存
    props.profile.__whiteWind = results.records

    return results.records
  }, []),
})
</script>

<template>
  <Atmosphere
    v-if="state.records.length > 0"
    class="white-wind"
    title="pnWhiteWind"
    icon="https://whtwnd.com/whtwnd.svg"
    :uri="`https://whtwnd.com/${profile?.handle}`"
  >
    <template #body>
      <div class="white-wind__container">
        <template v-for="record of state.records">
          <a
            class="white-wind__item"
            :href="record.value.__href"
            rel="noreferrer"
            target="_blank"
          >
            <div class="white-wind__title">{{ record.value.title }}</div>
            <div class="white-wind__content">{{ record.value.content }}</div>
            <div class="white-wind__createdAt">{{ record.value.__createdAt }}</div>
          </a>
        </template>
      </div>
    </template>
  </Atmosphere>
</template>

<style lang="scss" scoped>
.white-wind {
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
      min-width: calc(50% - 1rem);
      max-width: calc(50% - 1rem);
    }
  }

  // レコードが2つの場合
  &__container:has(&__item:nth-child(2):last-child) &__item {
    min-width: calc(50% - 0.25rem);
    max-width: calc(50% - 0.25rem);
  }

  &__title {
    font-size: 0.875rem;
    font-weight: bold;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__content {
    color: rgb(var(--fg-color), 0.75);
    flex-grow: 1;
    font-size: 0.875rem;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__createdAt {
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.75rem;
    line-height: var(--line-height-middle);
    text-align: right;
    word-break: break-word;
  }
}
</style>
