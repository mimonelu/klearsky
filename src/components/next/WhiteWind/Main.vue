<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import SVGIcon from "@/components/images/SVGIcon.vue"

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
  <div
    v-if="state.records.length > 0"
    class="white-wind"
  >
    <div class="white-wind__container">
      <template v-for="record of state.records">
        <a
          class="white-wind__item"
          :href="record.value.__href"
          rel="noreferrer"
          target="_blank"
        >
          <div class="white-wind__header">
            <SVGIcon name="openInApp" />
            <span>{{ $t("pnWhiteWind") }}</span>
          </div>
          <div class="white-wind__title">{{ record.value.title }}</div>
          <div class="white-wind__content">{{ record.value.content }}</div>
          <div class="white-wind__createdAt">{{ record.value.__createdAt }}</div>
        </a>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.white-wind {
  display: grid;

  &__container {
    display: flex;
    grid-gap: 0.5em;
    overflow-x: auto;
    overflow-y: hidden;
    @include scroll-bar(transparent);
  }

  &__item {
    background-color: rgb(var(--accent-color), 0.125);
    border-radius: var(--border-radius-middle);
    color: var(--fg-color);
    display: grid;
    grid-template-rows: auto 1fr auto;
    flex-direction: column;
    grid-gap: 0.25em;
    padding: 0.75em;

    // レコードが1つの場合
    &:first-child:last-child {
      min-width: 100%;
      max-width: 100%;
    }

    // レコードが2つ以上の場合（3つ目をチラ見せする）
    &:not(:first-child:last-child) {
      min-width: calc(50% - 1em);
      max-width: calc(50% - 1em);
    }
  }

  // レコードが2つの場合
  &__container:has(&__item:nth-child(2):last-child) &__item {
    min-width: calc(50% - 0.25em);
    max-width: calc(50% - 0.25em);
  }

  &__header {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: auto 1fr;
    align-items: center;
    font-size: 0.875em;

    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }

    & > span {
      color: rgb(var(--accent-color));
      font-weight: bold;
      line-height: var(--line-height-middle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__title {
    font-size: 0.875em;
    font-weight: bold;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__content {
    color: rgb(var(--fg-color), 0.75);
    flex-grow: 1;
    font-size: 0.875em;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__createdAt {
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.75em;
    line-height: var(--line-height-middle);
    text-align: right;
    word-break: break-word;
  }
}
</style>
