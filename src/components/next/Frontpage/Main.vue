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
  records: Ref<Array<any>>
}>({
  records: computedAsync<Array<any>>(async () => {
    if (props.profile == null) {
      return []
    }

    // プロフィールデータにキャッシュがあれば再利用
    if (props.profile.__frontpage != null) {
      return props.profile.__frontpage
    }

    // プロフィールデータのコレクションに該当レコードがなければ中止
    if (!props.profile.__repo?.collections?.includes("fyi.unravel.frontpage.post")) {
      return []
    }

    const results = await mainState.atp.fetchRecords(
      props.profile.did,
      "fyi.unravel.frontpage.post",
      NUMBER_OF_FETCH_RECORDS,
    )
    if (results instanceof Error) {
      return []
    }
    const records = results.records
    if (records == null) {
      return []
    }

    // プロフィールデータにキャッシュを保存
    props.profile.__frontpage = records

    return records
  }, []),
})
</script>

<template>
  <div
    v-if="state.records.length > 0"
    class="frontpage"
  >
    <a
      class="frontpage__header"
      :href="`https://frontpage.fyi/profile/${profile?.handle}`"
      rel="noreferrer"
      target="_blank"
    >
      <SVGIcon name="openInApp" />
      <span>{{ $t("pnFrontpage") }}</span>
    </a>
    <template v-for="record of state.records">
      <a
        class="textlink--icon"
        :href="record.value?.url"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="link" />
        <span>{{ record.value?.title }}</span>
      </a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.frontpage {
  background-color: rgb(var(--cyan-dark-color), 0.125);
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;

  &__header {
    --alpha: 0.75;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: auto 1fr;
    align-items: center;
    &:focus, &:hover {
      --alpha: 1.0;
    }

    & > .svg-icon {
      fill: rgb(var(--cyan-dark-color), var(--alpha));
    }

    & > span {
      color: rgb(var(--cyan-dark-color), var(--alpha));
      font-weight: bold;
      line-height: var(--line-height-middle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .textlink--icon {
    & > .svg-icon {
      font-size: 0.875em;
    }

    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: text;
      white-space: nowrap;
    }
  }
}
</style>
